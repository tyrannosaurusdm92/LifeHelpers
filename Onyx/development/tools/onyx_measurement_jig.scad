// Onyx measurement/debug jig. Units: millimeters.
// This is NOT a room model and contains no cat replacement geometry.
// It exists only to validate real-world scale around the canonical Onyx mesh.

inch = 25.4;
bar = 4;
tick = 36;

nose_to_tail_base = 23.5 * inch;
tail_mid = 14.5 * inch;
normal_overall = 38 * inch;
full_stretch_mid = 41 * inch;
shoulder_height = 14 * inch;
chest_width = 11 * inch;
curled_length = 19.5 * inch;
curled_width = 13.5 * inch;

module dimension_bar(length, y=0, z=0) {
    translate([0,y,z]) cube([length,bar,bar]);
    translate([0,y-tick/2,z-bar]) cube([bar,tick,bar*3]);
    translate([length-bar,y-tick/2,z-bar]) cube([bar,tick,bar*3]);
}

module vertical_bar(height, x=0, y=0) {
    translate([x,y,0]) cube([bar,bar,height]);
    translate([x-tick/2,y-bar,height-bar]) cube([tick,bar*3,bar]);
}

// Horizontal scale references are staggered so exported STL can be inspected directly.
dimension_bar(nose_to_tail_base, 0, 0);
dimension_bar(tail_mid, 55, 0);
dimension_bar(normal_overall, 110, 0);
dimension_bar(full_stretch_mid, 165, 0);

// Shoulder-height and chest-width references.
vertical_bar(shoulder_height, -70, 0);
translate([-70 - chest_width/2, 230, shoulder_height]) cube([chest_width,bar,bar]);
translate([-70 - chest_width/2, 230-tick/2, shoulder_height-bar]) cube([bar,tick,bar*3]);
translate([-70 + chest_width/2-bar, 230-tick/2, shoulder_height-bar]) cube([bar,tick,bar*3]);

// Curled footprint reference rectangle, wire-like bars only.
translate([0, 310, 0]) {
    cube([curled_length, bar, bar]);
    translate([0, curled_width-bar, 0]) cube([curled_length, bar, bar]);
    cube([bar, curled_width, bar]);
    translate([curled_length-bar, 0, 0]) cube([bar, curled_width, bar]);
}
