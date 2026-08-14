#!/usr/bin/env python3
"""Build the nondestructive Onyx body/face correction stack as Blender shape keys.

Run from Blender, for example:
  blender --background --python blender_build_onyx_shape_keys.py -- \
    --input ../../models/fbx/cat.fbx --output ../reference/onyx_body_pass_working.blend

The protected SmellyCat-derived canonical FBX is never overwritten. These keys mirror the
runtime vertex-delta layers while preserving topology, vertex order, UVs and armature data.
"""
import argparse
import os
import sys
import bpy


def clamp01(v):
    return max(0.0, min(1.0, v))


def smooth_bell(value, center, half_width):
    t = clamp01(1.0 - abs(value - center) / half_width)
    return t * t * (3.0 - 2.0 * t)


def parse_args():
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args(argv)


def group_weight(obj, vertex_index, names):
    wanted = {obj.vertex_groups[name].index for name in names if name in obj.vertex_groups}
    return sum(m.weight for m in obj.data.vertices[vertex_index].groups if m.group in wanted)


def ensure_basis(obj):
    if not obj.data.shape_keys:
        obj.shape_key_add(name="Basis", from_mix=False)
    return obj.data.shape_keys.key_blocks.get("Basis") or obj.shape_key_add(name="Basis", from_mix=False)


def replace_key(obj, name):
    keys = obj.data.shape_keys.key_blocks if obj.data.shape_keys else None
    if keys and name in keys:
        obj.active_shape_key_index = list(keys).index(keys[name])
        bpy.ops.object.shape_key_remove()
    return obj.shape_key_add(name=name, from_mix=False)


def main():
    args = parse_args()
    input_path, output_path = map(os.path.abspath, (args.input, args.output))
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=input_path, use_anim=True)

    obj = bpy.data.objects.get("Cat")
    if obj is None:
        obj = next((o for o in bpy.context.scene.objects if o.type == "MESH" and o.name.lower() == "cat"), None)
    if obj is None or obj.type != "MESH":
        raise RuntimeError("Could not find canonical Cat mesh after FBX import")

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    source_count = len(obj.data.vertices)
    basis = ensure_basis(obj)
    if len(basis.data) != source_count:
        raise RuntimeError("Basis vertex count does not match source mesh")

    keys = {
        "anatomy": replace_key(obj, "Onyx_PrimaryAnatomy"),
        "carriage": replace_key(obj, "Onyx_HindquarterCarriage"),
        "chest": replace_key(obj, "Onyx_ChestFlow"),
        "pouch": replace_key(obj, "Onyx_PrimordialPouch"),
        "face": replace_key(obj, "Onyx_FaceCorrections"),
    }
    torso_names = ["Hip", "Spine001", "Spine002", "Spine003", "Spine004"]
    leg_names = [
        "Thigh_Back_L", "Calf_back_L", "Thigh_Back_R", "Calf_back_R",
        "Thigh_front_L", "Calf_Front_L", "Thigh_front_R", "Calf_Front_R",
    ]

    for i, vert in enumerate(obj.data.vertices):
        bx, by, bz = vert.co.x, vert.co.y, vert.co.z
        torso_inf = group_weight(obj, i, torso_names)
        leg_inf = group_weight(obj, i, leg_names)
        limb_limiter = max(0.44, 1.0 - min(1.0, leg_inf * 1.18))

        # Sequential runtime state; each Blender key stores only that layer's delta from Basis.
        x, y, z = bx, by, bz

        x0, y0, z0 = x, y, z
        shoulder = smooth_bell(by, -1.60, 1.62) * smooth_bell(bz, 1.78, 1.48)
        x *= 1.0 + 0.092 * shoulder
        torso_mass = smooth_bell(by, 0.20, 2.45) * smooth_bell(bz, 1.43, 1.55)
        x *= 1.0 + 0.042 * torso_mass
        keys["anatomy"].data[i].co = (bx + x-x0, by + y-y0, bz + z-z0)

        x0, y0, z0 = x, y, z
        rear = smooth_bell(by, 2.25, 2.05) * smooth_bell(bz, 1.92, 1.72)
        dorsal = smooth_bell(by, 2.05, 2.35) * smooth_bell(bz, 2.72, 1.22)
        bridge = smooth_bell(by, 0.88, 3.08) * smooth_bell(bz, 2.46, 1.26)
        support = (0.76 + min(0.24, torso_inf * 0.36)) * limb_limiter
        z -= 0.305 * rear * support
        z -= 0.090 * dorsal * support
        z -= 0.060 * bridge * limb_limiter
        y += 0.072 * rear * support
        x *= 1.0 + 0.026 * rear * support
        keys["carriage"].data[i].co = (bx + x-x0, by + y-y0, bz + z-z0)

        x0, y0, z0 = x, y, z
        chest = smooth_bell(by, -1.18, 1.64) * smooth_bell(bz, 0.98, 1.22)
        sternum = smooth_bell(by, -1.18, 1.55) * smooth_bell(bz, 0.48, 0.76)
        neck = smooth_bell(by, -2.38, 1.24) * smooth_bell(bz, 2.22, 1.18)
        x *= 1.0 + 0.052 * chest
        z -= 0.047 * chest
        z -= 0.042 * sternum * limb_limiter
        x *= 1.0 + 0.026 * neck
        scapular = smooth_bell(by, -1.48, 1.72) * smooth_bell(bz, 2.48, 0.96) * limb_limiter
        pectoral = smooth_bell(by, -1.55, 1.36) * smooth_bell(bz, 0.86, 0.72) * limb_limiter
        x *= 1.0 + 0.020 * scapular
        z -= 0.032 * scapular
        y += 0.018 * scapular
        x *= 1.0 + 0.018 * pectoral
        z -= 0.028 * pectoral
        keys["chest"].data[i].co = (bx + x-x0, by + y-y0, bz + z-z0)

        x0, y0, z0 = x, y, z
        belly_y = smooth_bell(by, 0.70, 1.56)
        belly_z = smooth_bell(bz, 0.63, 0.72)
        belly_side = clamp01((1.31 - abs(bx)) / 0.84)
        torso_support = 0.86 + min(0.14, torso_inf * 0.22)
        pw = belly_y * belly_z * (0.70 + 0.30 * belly_side) * limb_limiter * torso_support
        z -= 0.62 * pw
        x *= 1.0 + 0.112 * pw
        y += 0.070 * pw
        keys["pouch"].data[i].co = (bx + x-x0, by + y-y0, bz + z-z0)

        x0, y0, z0 = x, y, z
        head_w = group_weight(obj, i, ["Head"])
        nose_w = group_weight(obj, i, ["Nose"])
        mouth_w = group_weight(obj, i, ["Mouth"])
        head_shape = head_w * clamp01((bz - 1.96) / 1.62)
        x *= 1.0 + 0.034 * head_shape
        upper = head_w * smooth_bell(bz, 3.18, 0.72)
        x *= 1.0 - 0.018 * upper
        muzzle = max(mouth_w, nose_w * 0.64) * smooth_bell(bz, 2.36, 0.61)
        x *= 1.0 + 0.066 * muzzle
        y -= 0.034 * muzzle
        if nose_w > 0:
            tip = nose_w * clamp01((-4.10 - by) / 0.76) * smooth_bell(bz, 2.68, 0.62)
            y -= 0.115 * tip
            x *= 1.0 - 0.040 * tip
            z += 0.018 * tip
        if mouth_w > 0:
            chin = mouth_w * smooth_bell(bz, 2.18, 0.43)
            y -= 0.056 * chin
            z -= 0.052 * chin
            x *= 1.0 + 0.030 * chin
        keys["face"].data[i].co = (bx + x-x0, by + y-y0, bz + z-z0)

    if len(obj.data.vertices) != source_count:
        raise RuntimeError("Topology changed while building shape keys; aborting")

    for key in keys.values():
        key.value = 1.0
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=output_path)
    print(f"Saved Onyx body-pass shape-key working file: {output_path}")
    print(f"Vertex count preserved: {source_count}")


if __name__ == "__main__":
    main()
