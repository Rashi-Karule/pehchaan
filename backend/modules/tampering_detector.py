import os
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import io
from typing import Tuple, List, Dict, Any
from models import TamperingDetectionResult

def compute_ela(image_path: str, quality: int = 90) -> Tuple[np.ndarray, float, bool]:
    """
    Perform Error Level Analysis (ELA).
    Detects differential JPEG compression artifacts across image regions.
    """
    original = Image.open(image_path).convert('RGB')
    
    # Save to memory buffer at specified JPEG quality
    buffer = io.BytesIO()
    original.save(buffer, 'JPEG', quality=quality)
    buffer.seek(0)
    
    # Re-open compressed image
    resaved = Image.open(buffer)
    
    # Compute absolute pixel-level difference
    ela_image = ImageChops.difference(original, resaved)
    
    # Calculate extrema
    extrema = ela_image.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    if max_diff == 0:
        max_diff = 1
    
    scale = 255.0 / max(max_diff, 12)
    ela_enhanced = ImageEnhance.Brightness(ela_image).enhance(min(scale, 12.0))
    
    ela_np = np.array(ela_enhanced)
    ela_gray = cv2.cvtColor(ela_np, cv2.COLOR_RGB2GRAY)
    
    # Analyze variance across local blocks, ignoring the very bottom MRZ zone
    h, w = ela_gray.shape
    block_size = 32
    variances = []
    means = []
    
    scan_h = int(h * 0.80)
    for y in range(0, scan_h - block_size + 1, block_size):
        for x in range(0, w - block_size + 1, block_size):
            block = ela_gray[y:y+block_size, x:x+block_size]
            variances.append(float(np.var(block)))
            means.append(float(np.mean(block)))
            
    if len(variances) > 0:
        var_array = np.array(variances)
        mean_array = np.array(means)
        
        q75, q25 = np.percentile(var_array, [75, 25])
        iqr = q75 - q25
        median_var = float(np.median(var_array))
        
        # Spliced regions create high local variance outliers
        outliers = np.sum(var_array > (q75 + 3.0 * iqr)) if iqr > 1.0 else 0
        outlier_ratio = outliers / len(var_array)
        
        max_mean_diff = float(np.max(mean_array))
        avg_mean_diff = float(np.mean(mean_array))
        
        # High disparity between max block brightness and average indicates spliced element
        disparity = (max_mean_diff - avg_mean_diff) / (avg_mean_diff + 5.0)
        
        ela_score = float(np.clip((outlier_ratio * 300.0) + (disparity * 22.0), 0.0, 100.0))
    else:
        ela_score = 5.0
        
    anomaly_detected = (ela_score > 35.0)
    return ela_gray, round(ela_score, 2), anomaly_detected

def compute_copy_move(img: np.ndarray) -> Tuple[np.ndarray, float, int, bool]:
    """
    Detect copy-move forgery using OpenCV ORB feature matching and 2D spatial displacement voting.
    """
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()
        
    h, w = gray.shape
    mask = np.zeros((h, w), dtype=np.uint8)
    
    # Mask out the bottom MRZ area to prevent repeating '<' characters from tripping false matches
    roi_mask = np.ones((h, w), dtype=np.uint8) * 255
    roi_mask[int(h * 0.80):, :] = 0
    
    orb = cv2.ORB_create(nfeatures=2500, fastThreshold=10, scoreType=cv2.ORB_FAST_SCORE)
    keypoints, descriptors = orb.detectAndCompute(gray, mask=roi_mask)
    
    if descriptors is None or len(keypoints) < 30:
        return mask, 0.0, 0, False
        
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    try:
        matches = bf.knnMatch(descriptors, descriptors, k=6)
    except Exception:
        return mask, 0.0, 0, False
        
    votes: Dict[Tuple[int, int], List[Tuple[Any, Any]]] = {}
    bin_size = 12
    
    for match_group in matches:
        if len(match_group) < 2:
            continue
        for candidate in match_group[1:]:
            if candidate.distance < 32: # strict descriptor similarity
                p1 = keypoints[candidate.queryIdx].pt
                p2 = keypoints[candidate.trainIdx].pt
                
                dx = p2[0] - p1[0]
                dy = p2[1] - p1[1]
                spatial_dist = np.hypot(dx, dy)
                
                # Exclude purely horizontal / vertical line text repeats
                if spatial_dist > 90 and abs(dx) > 35 and abs(dy) > 25:
                    bx = int(round(dx / bin_size))
                    by = int(round(dy / bin_size))
                    key = (bx, by)
                    if key not in votes:
                        votes[key] = []
                    votes[key].append((p1, p2))
                    
    detected_clones = []
    for (bx, by), pairs in votes.items():
        if len(pairs) >= 6: # At least 6 keypoints voting for identical 2D offset
            pts1 = np.array([p[0] for p in pairs])
            w_spread = np.max(pts1[:, 0]) - np.min(pts1[:, 0])
            h_spread = np.max(pts1[:, 1]) - np.min(pts1[:, 1])
            if w_spread > 25 and h_spread > 25: # Genuine 2D area (stamp/patch)
                detected_clones.append(pairs)
                for p1, p2 in pairs:
                    cv2.circle(mask, (int(p1[0]), int(p1[1])), 24, 255, -1)
                    cv2.circle(mask, (int(p2[0]), int(p2[1])), 24, 255, -1)
                    cv2.line(mask, (int(p1[0]), int(p1[1])), (int(p2[0]), int(p2[1])), 230, 2)
                    
    cloned_count = len(detected_clones)
    total_pairs = sum(len(c) for c in detected_clones)
    copy_move_score = min(100.0, float(cloned_count * 45.0 + total_pairs * 1.5))
    detected = (cloned_count >= 1 or copy_move_score >= 35.0)
    
    return mask, round(copy_move_score, 2), cloned_count, detected

def generate_tampering_heatmap(image_path: str, output_overlay_path: str) -> TamperingDetectionResult:
    """
    Combines ELA and Copy-Move Forgery Detection into a multi-layer forensic heatmap.
    Saves an RGBA transparent heatmap overlay PNG for frontend rendering.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path}")
        
    h, w = img.shape[:2]
    
    # 1. ELA Map
    ela_gray, ela_score, ela_anomaly = compute_ela(image_path)
    ela_resized = cv2.resize(ela_gray, (w, h))
    
    # 2. Copy-Move Map
    cm_mask, cm_score, cloned_count, cm_detected = compute_copy_move(img)
    
    # 3. Anomaly Fusion
    norm_ela = cv2.normalize(ela_resized.astype(np.float32), None, 0, 255, cv2.NORM_MINMAX)
    norm_cm = cv2.normalize(cm_mask.astype(np.float32), None, 0, 255, cv2.NORM_MINMAX)
    
    composite = (0.35 * norm_ela) + (0.65 * norm_cm)
    
    # Smooth with Gaussian blur
    smoothed = cv2.GaussianBlur(composite, (29, 29), 0)
    smoothed_norm = cv2.normalize(smoothed, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    
    # Turbo Colormap
    colored_heatmap = cv2.applyColorMap(smoothed_norm, cv2.COLORMAP_TURBO)
    
    # Dynamic alpha channel: clean areas stay completely transparent
    alpha = cv2.normalize(smoothed_norm.astype(np.float32), None, 0, 220, cv2.NORM_MINMAX).astype(np.uint8)
    alpha = np.where(smoothed_norm < 75, 0, alpha).astype(np.uint8)
    
    rgba_heatmap = cv2.cvtColor(colored_heatmap, cv2.COLOR_BGR2BGRA)
    rgba_heatmap[:, :, 3] = alpha
    
    # Save overlay PNG
    cv2.imwrite(output_overlay_path, rgba_heatmap)
    
    # Overall score
    tampering_score = round(min(100.0, (ela_score * 0.4) + (cm_score * 0.6)), 2)
    is_tampered = bool(cloned_count >= 1 or (ela_anomaly and tampering_score >= 48.0) or tampering_score >= 55.0)
    
    details = []
    if ela_anomaly:
        details.append(f"Error Level Analysis variance anomaly detected (Score: {ela_score}/100), indicating digital editing or inserted graphic layers.")
    else:
        details.append(f"Error Level Analysis within normal baseline (Score: {ela_score}/100).")
        
    if cm_detected:
        details.append(f"Detected {cloned_count} cloned region cluster(s) (Copy-Move Score: {cm_score}/100), indicating duplicated stamps/text.")
    else:
        details.append(f"No copy-move cloned regions detected (Score: {cm_score}/100).")
        
    heatmap_filename = os.path.basename(output_overlay_path)
    doc_id = heatmap_filename.replace("heatmap_", "").replace(".png", "")
    heatmap_url = f"/api/documents/{doc_id}/heatmap"
    
    return TamperingDetectionResult(
        ela_score=ela_score,
        copy_move_score=cm_score,
        tampering_score=tampering_score,
        is_tampered=is_tampered,
        heatmap_url=heatmap_url,
        cloned_regions_count=cloned_count,
        ela_anomaly_detected=ela_anomaly,
        copy_move_detected=cm_detected,
        details=details
    )
