"""
Architectural Rebuild of HAIR_003 — Chin-Length Rounded Bob (V17).
Matches the 4-panel visual reference sheet:
- Cohesive, continuous crown and fringe surface with concealed overlapping roots.
- Fringe divides ONLY in the lower 35-40% into 5 soft, broad, flattened, tapered lock tips.
- Soft cheek-framing side sections curving inward under the chin.
- Rear hair with subtle directional lobes/groups and softly varied perimeter curling under the nape.
- Fully enclosed scalp (zero skin gaps at temples or roots).
- Matched camera scale (close head-and-shoulders portrait framing).
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler
import os
import shutil

FACTORY_DIR = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\factory"
OUTPUTS_DIR = os.path.join(FACTORY_DIR, "outputs")
GLB_DIR = os.path.join(OUTPUTS_DIR, "hairstyles_glb")
BLEND_DIR = os.path.join(OUTPUTS_DIR, "hairstyles_blend")
PREVIEWS_DIR = os.path.join(FACTORY_DIR, "previews", "hair_003_v17_review")
ARTIFACT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\87b9cd6a-c34c-4a94-a366-03341960cd2e"

os.makedirs(PREVIEWS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

import sys
if FACTORY_DIR not in sys.path:
    sys.path.append(FACTORY_DIR)
import character_factory

CANONICAL_BLEND = r"C:\Users\Admin\Desktop\GAME\GAME-KNDMST\blender\character_prototype\scenes\Chibi_Base_Canonical_v1.blend"

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

def catmull_rom(p0, p1, p2, p3, t):
    t2 = t * t
    t3 = t2 * t
    return 0.5 * (
        (2.0 * p1) +
        (-p0 + p2) * t +
        (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 +
        (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3
    )

def build_bob_v17(arm, char_id, mat_mode="production"):
    """
    Constructs the V17 Chin-Length Rounded Bob.
    Returns: Blender object 'Hair_HAIR_003' bound to the rig.
    """
    bm = bmesh.new()

    cranial_center = Vector((0.0, -0.010, 0.528))
    center_y = -0.010
    center_z = 0.528

    mat_scalp = 0
    mat_crown = 1
    mat_fringe = 2
    mat_sides = 3
    mat_rear = 1

    # =========================================================================
    # 1. INNER SCALP CAP (Watertight Protective Underlayer)
    # =========================================================================
    # Prevents any exposed scalp under all viewing angles
    rx_s, ry_s, rz_s = 0.174, 0.166, 0.154
    num_rings_s, segs_s = 14, 28
    scalp_rings = []
    for r in range(num_rings_s):
        v = (r + 1) / float(num_rings_s)
        phi = v * math.radians(102.0) # covers past equator
        row = []
        for s in range(segs_s):
            u = 2.0 * math.pi * s / segs_s
            px = rx_s * math.sin(phi) * math.sin(u)
            py = ry_s * math.sin(phi) * math.cos(u) + center_y
            pz = center_z + rz_s * math.cos(phi)
            row.append(bm.verts.new(Vector((px, py, pz))))
        scalp_rings.append(row)

    apex_s = bm.verts.new(Vector((0.0, center_y, center_z + rz_s)))
    for s in range(segs_s):
        sn = (s + 1) % segs_s
        f = bm.faces.new((apex_s, scalp_rings[0][s], scalp_rings[0][sn]))
        f.material_index = mat_scalp

    for r in range(num_rings_s - 1):
        for s in range(segs_s):
            sn = (s + 1) % segs_s
            f = bm.faces.new((scalp_rings[r][s], scalp_rings[r][sn], scalp_rings[r+1][sn], scalp_rings[r+1][s]))
            f.material_index = mat_scalp

    # =========================================================================
    # 2. MAIN BOB VOLUME (Crown, Rear Mass, and Outer Sides)
    # =========================================================================
    # Lofted volume from crown apex to chin/nape level
    # Rear features 4-5 broad stylized lobes with an inward curled bottom hem.
    rx_b, ry_b, rz_b = 0.188, 0.178, 0.168
    num_rings_b, segs_b = 22, 40
    bob_rings = []
    
    for r in range(num_rings_b):
        v = (r + 1) / float(num_rings_b)
        row = []
        for s in range(segs_b):
            u = 2.0 * math.pi * s / segs_b
            sin_u, cos_u = math.sin(u), math.cos(u)

            # Check if in front face opening (cos_u > 0.35)
            if cos_u > 0.35:
                # Front crown: slopes down to Z ~ 0.635m to merge seamlessly with fringe roots
                max_phi = math.radians(52.0)
                puff = 0.008 + 0.004 * math.sin(v * math.pi)
                phi = v * max_phi
                px = (rx_b + puff) * math.sin(phi) * sin_u
                py = (ry_b + puff) * math.sin(phi) * cos_u + center_y
                pz = center_z + (rz_b + puff) * math.cos(phi)
            else:
                # Sides & Back: flows all the way down to chin/nape level
                target_edge_z = 0.422 + 0.005 * math.cos(u * 4.0)

                if v < 0.38:
                    phi = (v / 0.38) * math.radians(88.0)
                    puff = 0.009 + 0.005 * math.sin(v * math.pi * 2.5)
                    px = (rx_b + puff) * math.sin(phi) * sin_u
                    py = (ry_b + puff) * math.sin(phi) * cos_u + center_y
                    pz = center_z + (rz_b + puff) * math.cos(phi)
                else:
                    fac = (v - 0.38) / 0.62
                    phi = math.radians(88.0)
                    base_pz = center_z + rz_b * math.cos(phi)
                    pz = base_pz + fac * (target_edge_z - base_pz)

                    # 4-5 stylized lobes across the rear
                    rear_fac = max(0.0, -cos_u)
                    lobes = 0.007 * (math.cos(4.0 * u) + 0.3 * math.cos(2.0 * u)) * rear_fac
                    puff = 0.010 + lobes + 0.005 * math.sin(fac * math.pi)

                    # Inward cupping curl around neck and lower jaw
                    tuck = fac * fac
                    tuck_y = 0.016 * tuck * rear_fac
                    tuck_x = -math.copysign(0.014 * tuck * (1.0 - rear_fac), sin_u)

                    px = (rx_b + puff) * math.sin(phi) * sin_u + tuck_x
                    py = (ry_b + puff) * math.sin(phi) * cos_u + center_y + tuck_y

            # Ear clearance on sides
            if abs(cos_u) < 0.22 and 0.45 < v < 0.88:
                ear_dist = math.sqrt((abs(px) - 0.166)**2 + (py + 0.005)**2 + (pz - 0.515)**2)
                if ear_dist < 0.038:
                    px = math.copysign(max(abs(px), 0.188), px)

            row.append(bm.verts.new(Vector((px, py, pz))))
        bob_rings.append(row)

    # Apex vertex
    apex_b = bm.verts.new(Vector((0.0, center_y, center_z + rz_b + 0.010)))
    for s in range(segs_b):
        sn = (s + 1) % segs_b
        f = bm.faces.new((apex_b, bob_rings[0][s], bob_rings[0][sn]))
        f.material_index = mat_crown

    for r in range(num_rings_b - 1):
        for s in range(segs_b):
            sn = (s + 1) % segs_b
            f = bm.faces.new((bob_rings[r][s], bob_rings[r][sn], bob_rings[r+1][sn], bob_rings[r+1][s]))
            f.material_index = mat_crown if r < 6 else mat_rear

    # Inward rolled hem at chin/nape rim
    rim_outer = bob_rings[-1]
    rim_inner = []
    for s in range(segs_b):
        vo = rim_outer[s]
        cos_u = math.cos(2.0 * math.pi * s / segs_b)
        if cos_u <= 0.35: # on rear/side perimeter
            p_in = vo.co + (Vector((0.0, center_y, vo.co.z)) - vo.co).normalized() * 0.015 + Vector((0, 0, 0.006))
        else: # front crown lip
            p_in = vo.co + Vector((0, -0.010, 0.004))
        rim_inner.append(bm.verts.new(p_in))

    for s in range(segs_b):
        sn = (s + 1) % segs_b
        f = bm.faces.new((rim_outer[s], rim_outer[sn], rim_inner[sn], rim_inner[s]))
        f.material_index = mat_rear

    # =========================================================================
    # 3. CONTINUOUS FRINGE WITH GROUPED TIPS (5 Sculpted Locks)
    # =========================================================================
    # The upper 60% is a CONTINUOUS quad grid (sharing vertices across boundaries).
    # The lower 40% splits into 5 soft, broad, tapered lock tips.
    # Lock definitions from character-left to character-right:
    # 0: Left Temple Transition lock
    # 1: Left-Center Main lock
    # 2: Center Accent lock (subtle notch)
    # 3: Right-Center Main lock
    # 4: Right Temple Transition lock

    lock_specs = [
        # Lock 0: Left temple transition
        {
            "ctrl_x": [-0.102, -0.110, -0.116, -0.118],
            "ctrl_y": [ 0.095,  0.125,  0.150,  0.154],
            "ctrl_z": [ 0.636,  0.612,  0.585,  0.562],
            "width":  [ 0.024,  0.026,  0.022,  0.016],
            "thick":  [ 0.010,  0.011,  0.009,  0.006],
            "taper_ang": -0.15
        },
        # Lock 1: Left-center main broad lock
        {
            "ctrl_x": [-0.052, -0.054, -0.050, -0.046],
            "ctrl_y": [ 0.118,  0.145,  0.168,  0.170],
            "ctrl_z": [ 0.640,  0.614,  0.582,  0.554],
            "width":  [ 0.026,  0.028,  0.026,  0.020],
            "thick":  [ 0.011,  0.012,  0.010,  0.007],
            "taper_ang": -0.08
        },
        # Lock 2: Center accent lock (slightly shorter wedge)
        {
            "ctrl_x": [ 0.000,  0.001,  0.003,  0.004],
            "ctrl_y": [ 0.124,  0.150,  0.170,  0.171],
            "ctrl_z": [ 0.642,  0.618,  0.590,  0.568],
            "width":  [ 0.022,  0.024,  0.020,  0.015],
            "thick":  [ 0.010,  0.012,  0.009,  0.006],
            "taper_ang": 0.0
        },
        # Lock 3: Right-center main broad lock
        {
            "ctrl_x": [ 0.052,  0.054,  0.050,  0.046],
            "ctrl_y": [ 0.118,  0.145,  0.168,  0.170],
            "ctrl_z": [ 0.640,  0.614,  0.582,  0.552],
            "width":  [ 0.026,  0.028,  0.026,  0.020],
            "thick":  [ 0.011,  0.012,  0.010,  0.007],
            "taper_ang": 0.08
        },
        # Lock 4: Right temple transition
        {
            "ctrl_x": [ 0.102,  0.110,  0.116,  0.118],
            "ctrl_y": [ 0.095,  0.125,  0.150,  0.154],
            "ctrl_z": [ 0.636,  0.612,  0.585,  0.562],
            "width":  [ 0.024,  0.026,  0.022,  0.016],
            "thick":  [ 0.010,  0.011,  0.009,  0.006],
            "taper_ang": 0.15
        },
    ]

    N_ROWS = 12
    N_COLS = 5 # 5 points across each ribbon (4 quads wide)
    SPLIT_ROW = 7 # Rows 0..7 share boundary vertices; rows 8..11 separate into distinct lock tips

    # Generate grid coordinates for all 5 locks
    # Each vertex will have an outer surface position and an inner thickness position
    all_lock_grids_outer = []
    all_lock_grids_inner = []

    for l_idx, spec in enumerate(lock_specs):
        c_x, c_y, c_z = spec["ctrl_x"], spec["ctrl_y"], spec["ctrl_z"]
        w_prof, th_prof = spec["width"], spec["thick"]
        t_ang = spec["taper_ang"]

        grid_outer = []
        grid_inner = []

        for r in range(N_ROWS):
            v = r / float(N_ROWS - 1)
            # Evaluate spline position
            seg = v * 2.9999
            i_seg = int(seg)
            t_seg = seg - i_seg
            p0 = Vector((c_x[max(0, i_seg - 1)], c_y[max(0, i_seg - 1)], c_z[max(0, i_seg - 1)]))
            p1 = Vector((c_x[i_seg], c_y[i_seg], c_z[i_seg]))
            p2 = Vector((c_x[min(3, i_seg + 1)], c_y[min(3, i_seg + 1)], c_z[min(3, i_seg + 1)]))
            p3 = Vector((c_x[min(3, i_seg + 2)], c_y[min(3, i_seg + 2)], c_z[min(3, i_seg + 2)]))
            spine_pos = catmull_rom(p0, p1, p2, p3, t_seg)

            # Evaluate width and thickness
            w = w_prof[i_seg] * (1.0 - t_seg) + w_prof[min(3, i_seg + 1)] * t_seg
            th = th_prof[i_seg] * (1.0 - t_seg) + th_prof[min(3, i_seg + 1)] * t_seg

            # Inward curl at tips
            if v > 0.60:
                curl_fac = (v - 0.60) / 0.40
                spine_pos.y -= 0.007 * curl_fac * curl_fac
                spine_pos.z += 0.003 * curl_fac

            # Normal vector: pointing outwards from cranial center
            n_vec = (spine_pos - cranial_center).normalized()
            # Tangent vector down the spine
            if r < N_ROWS - 1:
                t_next = (v + 0.05) * 2.9999
                i_n = int(t_next)
                t_n = t_next - i_n
                p_next = catmull_rom(
                    Vector((c_x[max(0, i_n-1)], c_y[max(0, i_n-1)], c_z[max(0, i_n-1)])),
                    Vector((c_x[i_n], c_y[i_n], c_z[i_n])),
                    Vector((c_x[min(3, i_n+1)], c_y[min(3, i_n+1)], c_z[min(3, i_n+1)])),
                    Vector((c_x[min(3, i_n+2)], c_y[min(3, i_n+2)], c_z[min(3, i_n+2)])),
                    t_n
                )
                tangent = (p_next - spine_pos).normalized()
            else:
                tangent = Vector((0, 0, -1))

            # Lateral binormal
            binormal = tangent.cross(n_vec).normalized()
            # Rotate binormal slightly if taper_ang is set
            rot_mat = Matrix.Rotation(t_ang * v, 3, tangent)
            binormal = rot_mat @ binormal

            row_outer = []
            row_inner = []
            for c in range(N_COLS):
                u = (c / float(N_COLS - 1)) * 2.0 - 1.0 # -1 to +1
                # Cross-section cupping: center puffs outward slightly, edges curl back
                cupping = (1.0 - u * u) * 0.003
                pos_o = spine_pos + binormal * (u * 0.5 * w) + n_vec * cupping
                pos_i = pos_o - n_vec * th

                row_outer.append(pos_o)
                row_inner.append(pos_i)

            grid_outer.append(row_outer)
            grid_inner.append(row_inner)

        all_lock_grids_outer.append(grid_outer)
        all_lock_grids_inner.append(grid_inner)

    # Convert coordinates to BMesh vertices with shared root boundaries
    all_lock_verts_outer = []
    all_lock_verts_inner = []

    for l_idx in range(5):
        v_grid_o = []
        v_grid_i = []
        for r in range(N_ROWS):
            row_vo = []
            row_vi = []
            for c in range(N_COLS):
                # Check if this vertex should be shared with previous lock's right edge
                if r <= SPLIT_ROW and c == 0 and l_idx > 0:
                    # Share vertex with previous lock's last column
                    shared_vo = all_lock_verts_outer[l_idx - 1][r][-1]
                    shared_vi = all_lock_verts_inner[l_idx - 1][r][-1]
                    # Blend the position slightly for smooth transition
                    avg_co_o = 0.5 * (shared_vo.co + all_lock_grids_outer[l_idx][r][c])
                    avg_co_i = 0.5 * (shared_vi.co + all_lock_grids_inner[l_idx][r][c])
                    shared_vo.co = avg_co_o
                    shared_vi.co = avg_co_i
                    row_vo.append(shared_vo)
                    row_vi.append(shared_vi)
                else:
                    vo = bm.verts.new(all_lock_grids_outer[l_idx][r][c])
                    vi = bm.verts.new(all_lock_grids_inner[l_idx][r][c])
                    row_vo.append(vo)
                    row_vi.append(vi)
            v_grid_o.append(row_vo)
            v_grid_i.append(row_vi)
        all_lock_verts_outer.append(v_grid_o)
        all_lock_verts_inner.append(v_grid_i)

    # Connect faces for each lock (outer surface, inner surface, and side/tip thickness walls)
    for l_idx in range(5):
        v_o = all_lock_verts_outer[l_idx]
        v_i = all_lock_verts_inner[l_idx]

        for r in range(N_ROWS - 1):
            for c in range(N_COLS - 1):
                # Outer face
                f_out = bm.faces.new((v_o[r][c], v_o[r+1][c], v_o[r+1][c+1], v_o[r][c+1]))
                f_out.material_index = mat_fringe
                # Inner face (flipped normal)
                f_in = bm.faces.new((v_i[r][c+1], v_i[r+1][c+1], v_i[r+1][c], v_i[r][c]))
                f_in.material_index = mat_fringe

        # Thickness border along tip (row N_ROWS - 1)
        r_tip = N_ROWS - 1
        for c in range(N_COLS - 1):
            f_tip = bm.faces.new((v_o[r_tip][c], v_o[r_tip][c+1], v_i[r_tip][c+1], v_i[r_tip][c]))
            f_tip.material_index = mat_fringe

        # Lateral borders when separated (rows SPLIT_ROW to N_ROWS - 1)
        for r in range(SPLIT_ROW, N_ROWS - 1):
            # Left edge wall (c=0)
            if l_idx == 0 or r > SPLIT_ROW:
                f_lw = bm.faces.new((v_o[r+1][0], v_o[r][0], v_i[r][0], v_i[r+1][0]))
                f_lw.material_index = mat_fringe
            # Right edge wall (c=N_COLS-1)
            if l_idx == 4 or r > SPLIT_ROW:
                f_rw = bm.faces.new((v_o[r][N_COLS-1], v_o[r+1][N_COLS-1], v_i[r+1][N_COLS-1], v_i[r][N_COLS-1]))
                f_rw.material_index = mat_fringe

        # Far lateral outer borders (always closed for Lock 0 left and Lock 4 right)
        if l_idx == 0:
            for r in range(0, SPLIT_ROW):
                f_lw = bm.faces.new((v_o[r+1][0], v_o[r][0], v_i[r][0], v_i[r+1][0]))
                f_lw.material_index = mat_fringe
        if l_idx == 4:
            for r in range(0, SPLIT_ROW):
                f_rw = bm.faces.new((v_o[r][N_COLS-1], v_o[r+1][N_COLS-1], v_i[r+1][N_COLS-1], v_i[r][N_COLS-1]))
                f_rw.material_index = mat_fringe

    # =========================================================================
    # 4. CHEEK-FRAMING SIDE LOCKS (Temple to Chin Inward C-Curl)
    # =========================================================================
    # Left and Right broad locks flowing along cheeks, cupping the chin/jawline.
    # Seamlessly anchoring at the temple junction.
    side_locks = [
        # Right cheek lock (+X)
        {
            "ctrl_x": [ 0.108,  0.138,  0.150,  0.142,  0.130],
            "ctrl_y": [ 0.088,  0.085,  0.082,  0.080,  0.082],
            "ctrl_z": [ 0.630,  0.575,  0.515,  0.465,  0.422],
            "width":  [ 0.026,  0.034,  0.036,  0.030,  0.018],
            "thick":  [ 0.012,  0.015,  0.016,  0.013,  0.008],
            "side_sign": 1
        },
        # Left cheek lock (-X)
        {
            "ctrl_x": [-0.108, -0.138, -0.150, -0.142, -0.130],
            "ctrl_y": [ 0.088,  0.085,  0.082,  0.080,  0.082],
            "ctrl_z": [ 0.630,  0.575,  0.515,  0.465,  0.422],
            "width":  [ 0.026,  0.034,  0.036,  0.030,  0.018],
            "thick":  [ 0.012,  0.015,  0.016,  0.013,  0.008],
            "side_sign": -1
        }
    ]

    for s_spec in side_locks:
        c_x, c_y, c_z = s_spec["ctrl_x"], s_spec["ctrl_y"], s_spec["ctrl_z"]
        w_prof, th_prof = s_spec["width"], s_spec["thick"]
        sign = s_spec["side_sign"]

        N_SIDE_ROWS = 14
        N_SIDE_COLS = 5
        side_v_o = []
        side_v_i = []

        for r in range(N_SIDE_ROWS):
            v = r / float(N_SIDE_ROWS - 1)
            seg = v * 3.9999
            i_seg = int(seg)
            t_seg = seg - i_seg
            p0 = Vector((c_x[max(0, i_seg - 1)], c_y[max(0, i_seg - 1)], c_z[max(0, i_seg - 1)]))
            p1 = Vector((c_x[i_seg], c_y[i_seg], c_z[i_seg]))
            p2 = Vector((c_x[min(4, i_seg + 1)], c_y[min(4, i_seg + 1)], c_z[min(4, i_seg + 1)]))
            p3 = Vector((c_x[min(4, i_seg + 2)], c_y[min(4, i_seg + 2)], c_z[min(4, i_seg + 2)]))
            spine_pos = catmull_rom(p0, p1, p2, p3, t_seg)

            w = w_prof[i_seg] * (1.0 - t_seg) + w_prof[min(4, i_seg + 1)] * t_seg
            th = th_prof[i_seg] * (1.0 - t_seg) + th_prof[min(4, i_seg + 1)] * t_seg

            # Inward C-curl under jaw
            if v > 0.65:
                curl = (v - 0.65) / 0.35
                spine_pos.x -= sign * 0.012 * curl * curl
                spine_pos.y += 0.008 * curl * curl

            n_vec = (spine_pos - Vector((0.0, center_y, spine_pos.z))).normalized()
            tangent = Vector((0, 0, -1))
            binormal = tangent.cross(n_vec).normalized() * sign

            row_vo = []
            row_vi = []
            for c in range(N_SIDE_COLS):
                u = (c / float(N_SIDE_COLS - 1)) * 2.0 - 1.0
                cupping = (1.0 - u * u) * 0.003
                pos_o = spine_pos + binormal * (u * 0.5 * w) + n_vec * cupping
                pos_i = pos_o - n_vec * th
                row_vo.append(bm.verts.new(pos_o))
                row_vi.append(bm.verts.new(pos_i))

            side_v_o.append(row_vo)
            side_v_i.append(row_vi)

        for r in range(N_SIDE_ROWS - 1):
            for c in range(N_SIDE_COLS - 1):
                f_out = bm.faces.new((side_v_o[r][c], side_v_o[r+1][c], side_v_o[r+1][c+1], side_v_o[r][c+1]))
                f_out.material_index = mat_sides
                f_in = bm.faces.new((side_v_i[r][c+1], side_v_i[r+1][c+1], side_v_i[r+1][c], side_v_i[r][c]))
                f_in.material_index = mat_sides

        # Tip cap
        r_tip = N_SIDE_ROWS - 1
        for c in range(N_SIDE_COLS - 1):
            f_tip = bm.faces.new((side_v_o[r_tip][c], side_v_o[r_tip][c+1], side_v_i[r_tip][c+1], side_v_i[r_tip][c]))
            f_tip.material_index = mat_sides

        # Edge walls
        for r in range(N_SIDE_ROWS - 1):
            f_lw = bm.faces.new((side_v_o[r+1][0], side_v_o[r][0], side_v_i[r][0], side_v_i[r+1][0]))
            f_lw.material_index = mat_sides
            f_rw = bm.faces.new((side_v_o[r][N_SIDE_COLS-1], side_v_o[r+1][N_SIDE_COLS-1], side_v_i[r+1][N_SIDE_COLS-1], side_v_i[r][N_SIDE_COLS-1]))
            f_rw.material_index = mat_sides

    # Finalize BMesh
    mesh = bpy.data.meshes.new(f"Hair_HAIR_003_Mesh_{char_id}")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Hair_HAIR_003", mesh)
    bpy.context.scene.collection.objects.link(obj)

    # Materials
    if mat_mode == "diagnostic":
        colors = [
            ("M_Diag_Scalp", (0.15, 0.18, 0.22, 1.0)),     # Slate
            ("M_Diag_CrownRear", (0.35, 0.72, 0.45, 1.0)), # Sage green
            ("M_Diag_Fringe", (0.95, 0.50, 0.25, 1.0)),    # Warm coral
            ("M_Diag_Sides", (0.30, 0.65, 0.95, 1.0)),     # Sky blue
        ]
        for mname, rgba in colors:
            mat = bpy.data.materials.new(f"{mname}_{char_id}")
            mat.use_nodes = True
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = rgba
                bsdf.inputs["Roughness"].default_value = 0.55
                bsdf.inputs["Specular IOR Level"].default_value = 0.15
            obj.data.materials.append(mat)
    else:
        mat = bpy.data.materials.new(f"M_Hair_{char_id}")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            # Calibrated stylized dark brunette (#241c19)
            bsdf.inputs["Base Color"].default_value = (0.018, 0.010, 0.007, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.65
            bsdf.inputs["Specular IOR Level"].default_value = 0.18
            if "Sheen Weight" in bsdf.inputs:
                bsdf.inputs["Sheen Weight"].default_value = 0.20
        obj.data.materials.append(mat)

    for poly in obj.data.polygons:
        poly.use_smooth = True

    # Rig binding to Head bone
    vg = obj.vertex_groups.new(name="Head")
    all_v_indices = list(range(len(obj.data.vertices)))
    vg.add(all_v_indices, 1.0, 'REPLACE')

    mod = obj.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = arm

    return obj

def setup_chibi_portrait_studio(scene, res=(1024, 1024)):
    """
    Sets up studio lighting and camera with matched portrait framing
    identical to the user's 4-panel visual reference sheet.
    """
    for o in list(scene.collection.objects):
        if o.type in ('CAMERA', 'LIGHT'):
            bpy.data.objects.remove(o, do_unlink=True)

    cam_data = bpy.data.cameras.new("Portrait_Cam")
    cam_data.lens = 72 # 72mm portrait focal length (flattering, no distortion)
    cam = bpy.data.objects.new("Portrait_Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam

    scene.world = bpy.data.worlds.new("Studio_World")
    scene.world.use_nodes = True
    nodes = scene.world.node_tree.nodes
    nodes.clear()
    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    scene.world.node_tree.links.new(bg.outputs["Background"], out.inputs["Surface"])
    bg.inputs["Color"].default_value = (0.88, 0.88, 0.90, 1.0)
    bg.inputs["Strength"].default_value = 0.95

    def add_light(name, ltype, energy, loc, rot_deg, color=(1,1,1), size=0.8):
        l = bpy.data.lights.new(name, ltype)
        l.energy = energy
        l.color = color
        if ltype == 'AREA':
            l.size = size
        obj = bpy.data.objects.new(name, l)
        obj.location = loc
        obj.rotation_euler = (math.radians(rot_deg[0]), math.radians(rot_deg[1]), math.radians(rot_deg[2]))
        scene.collection.objects.link(obj)
        return obj

    # Soft studio portrait lighting matching the reference target
    add_light("Key_Light", 'AREA', 48.0, (0.35, 0.85, 0.75), (45, 0, 20), (1.0, 0.98, 0.96), size=1.0)
    add_light("Fill_Light", 'AREA', 34.0, (-0.40, 0.80, 0.62), (50, 0, -25), (0.96, 0.97, 1.0), size=1.2)
    add_light("Eye_Catch_Light", 'AREA', 18.0, (0.0, 0.95, 0.53), (90, 0, 0), (1.0, 0.99, 0.98), size=0.7)
    add_light("Rim_Light", 'AREA', 32.0, (0.0, -0.85, 0.80), (-45, 0, 180), (1.0, 1.0, 1.0), size=0.9)

    scene.render.resolution_x = res[0]
    scene.render.resolution_y = res[1]
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if hasattr(bpy.types, 'RenderSettings') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
    return cam

if __name__ == "__main__":
    print("\n=======================================================")
    print("RUNNING HAIR_003 V17 ARCHITECTURAL REBUILD PIPELINE")
    print("=======================================================")

    factory = character_factory.CharacterFactory(CANONICAL_BLEND)
    char_tag = "female_v17_hair_003"
    factory.load_base()
    factory.isolate_materials(char_tag)
    factory.apply_skin_tone("SKIN_02", char_tag)

    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)

    hair_obj = build_bob_v17(factory.arm, char_tag, mat_mode="production")
    print(f"[Built V17 Bob] {hair_obj.name}: {len(hair_obj.data.polygons)} quads, {len(hair_obj.data.vertices)} vertices")

    clothing_spec = {
        "top_id": "TOP_001",
        "bottom_id": "BOTTOM_001",
        "footwear_id": "FOOTWEAR_001",
        "socks_id": "SOCKS_001"
    }
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
    factory.equip_accessories([], char_tag) # Clean: zero unwanted accessories

    scene = bpy.context.scene
    cam = setup_chibi_portrait_studio(scene, res=(1024, 1024))

    # Matched camera setups (Head & shoulders portrait, exactly framing like reference)
    # Head center is at Z=0.528. Camera distance ~0.76m with 72mm lens.
    portrait_views = [
        ("front", (0.0, 0.76, 0.528), (math.radians(90), 0, math.radians(180))),
        ("three_quarter_left", (-0.54, 0.54, 0.536), (math.radians(82), 0, math.radians(-135))),
        ("three_quarter_right", (0.54, 0.54, 0.536), (math.radians(82), 0, math.radians(135))),
        ("profile_left", (-0.76, 0.0, 0.528), (math.radians(90), 0, math.radians(-90))),
        ("profile_right", (0.76, 0.0, 0.528), (math.radians(90), 0, math.radians(90))),
        ("rear", (0.0, -0.76, 0.528), (math.radians(90), 0, 0)),
        ("macro_fringe_roots", (0.0, 0.44, 0.585), (math.radians(80), 0, math.radians(180))),
        ("macro_temple_left", (-0.30, 0.35, 0.560), (math.radians(82), 0, math.radians(-140))),
        ("macro_temple_right", (0.30, 0.35, 0.560), (math.radians(82), 0, math.radians(140))),
    ]

    for vname, loc, rot in portrait_views:
        cam.location = loc
        cam.rotation_euler = rot
        out_name = f"hair_003_v17_{vname}.png"
        out_path = os.path.join(PREVIEWS_DIR, out_name)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, out_name))
        print(f"  [Rendered Production] -> {out_name}")

    # Render Diagnostic 4-Color View for construction proof
    print("\n[Step B] Rendering Diagnostic Construction Views...")
    factory.load_base()
    factory.isolate_materials(char_tag + "_diag")
    factory.apply_skin_tone("SKIN_02", char_tag + "_diag")
    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)
    hair_diag = build_bob_v17(factory.arm, char_tag + "_diag", mat_mode="diagnostic")
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag + "_diag")
    factory.equip_accessories([], char_tag + "_diag")

    cam = setup_chibi_portrait_studio(bpy.context.scene, res=(1024, 1024))
    diag_views = [
        ("diag_front", (0.0, 0.76, 0.528), (math.radians(90), 0, math.radians(180))),
        ("diag_three_quarter", (0.54, 0.54, 0.536), (math.radians(82), 0, math.radians(135))),
        ("diag_profile", (-0.76, 0.0, 0.528), (math.radians(90), 0, math.radians(-90))),
        ("diag_rear", (0.0, -0.76, 0.528), (math.radians(90), 0, 0)),
    ]
    for vname, loc, rot in diag_views:
        cam.location = loc
        cam.rotation_euler = rot
        out_name = f"hair_003_v17_{vname}.png"
        out_path = os.path.join(PREVIEWS_DIR, out_name)
        bpy.context.scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        shutil.copyfile(out_path, os.path.join(ARTIFACT_DIR, out_name))
        print(f"  [Rendered Diagnostic] -> {out_name}")

    # Re-build production for export
    print("\n[Step C] Saving .blend and exporting GLBs...")
    factory.load_base()
    factory.isolate_materials(char_tag)
    factory.apply_skin_tone("SKIN_02", char_tag)
    for o in list(bpy.data.objects):
        if o.name.startswith("Hair_"):
            bpy.data.objects.remove(o, do_unlink=True)
    hair_prod = build_bob_v17(factory.arm, char_tag, mat_mode="production")
    factory.equip_modular_clothing(clothing_spec, "#f4cfae", char_tag)
    factory.equip_accessories([], char_tag)

    # Runtime assertion: eye integrity
    eye_objs = {o.name for o in bpy.data.objects if "Eye" in o.name}
    assert {"Eye_L", "Eye_R", "Eye_HL1_L", "Eye_HL1_R", "Eye_HL2_L", "Eye_HL2_R"}.issubset(eye_objs)
    assert "Acc_Glasses" not in [o.name for o in bpy.data.objects]

    blend_path = os.path.join(BLEND_DIR, "hair_003_v17_source.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    shutil.copyfile(blend_path, os.path.join(PREVIEWS_DIR, "hair_003_v17_source.blend"))
    print(f"[Saved Blend] -> {blend_path}")

    glb_v17 = os.path.join(GLB_DIR, "character_hair_003_v17.glb")
    glb_std = os.path.join(GLB_DIR, "character_hair_003.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_v17,
        export_format='GLB',
        use_selection=False,
        export_apply=False,
        export_animations=True,
        export_skins=True,
        export_morph=True
    )
    shutil.copyfile(glb_v17, glb_std)
    shutil.copyfile(glb_v17, os.path.join(PREVIEWS_DIR, "character_hair_003_v17.glb"))
    print(f"[Exported GLBs] -> {glb_v17} & {glb_std}")
