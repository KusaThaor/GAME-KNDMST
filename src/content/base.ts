/** Dữ liệu nền: nhân vật, Mốc, năm học, bản đồ. (Mốc và năm học là NEW_CONFIRMED 14/11; phần còn lại PROPOSED.) */
import type { Character, MapDef, Milestone, SchoolYear } from './types';

/** Lớp 6–9 dùng chung rig; preset theo lớp quyết định chiều cao. */
export const CHARACTERS: Character[] = [
  { id: 'chr_player', display_name: '{player_name}', ui_color: '#2f6fb3', age_variants: { AGE_G6_7: { rig_id: 'player' }, AGE_G8_9: { rig_id: 'player' } } },
  { id: 'chr_duc', display_name: 'Đức', nickname: 'Tí Nổ', ui_color: '#e0702a', age_variants: { AGE_G6_7: { rig_id: 'duc' }, AGE_G8_9: { rig_id: 'duc' } } },
  { id: 'chr_quan', display_name: 'Quân', nickname: 'Bắp', ui_color: '#3f9a4e', age_variants: { AGE_G6_7: { rig_id: 'quan' }, AGE_G8_9: { rig_id: 'quan' } } },
  { id: 'chr_chau', display_name: 'Minh Châu', nickname: 'Châu Tổng', ui_color: '#8a55c9', age_variants: { AGE_G6_7: { rig_id: 'chau' }, AGE_G8_9: { rig_id: 'chau' } } },
  { id: 'chr_ha', display_name: 'Hạ', nickname: 'Mây', ui_color: '#e0608f', age_variants: { AGE_G6_7: { rig_id: 'ha' }, AGE_G8_9: { rig_id: 'ha' } } },
];

export const MILESTONES: Milestone[] = [
  { id: 'm1', title: 'Lớp 6–7 (2014–2016)', school_years: ['g06', 'g07'], palette_id: 'm1', box_compartment: 1 },
  { id: 'm2', title: 'Lớp 8–9 (2016–2018)', school_years: ['g08', 'g09'], palette_id: 'm2', box_compartment: 2 },
  { id: 'm3', title: 'Lớp 10–12 (2018–2021)', school_years: ['g10', 'g11', 'g12'], palette_id: 'm3', box_compartment: 3 },
];

const ALL5 = ['player', 'NPC_A', 'NPC_B', 'NPC_C', 'NPC_D'];
export const SCHOOL_YEARS: SchoolYear[] = [
  { id: 'g06', milestone_id: 'm1', start_year: 2014, end_year: 2015, age_range: [11, 12], age_variant: 'AGE_G6_7', group_members: ['player', 'NPC_A', 'NPC_B'], map_variant: 'g06' },
  { id: 'g07', milestone_id: 'm1', start_year: 2015, end_year: 2016, age_range: [12, 13], age_variant: 'AGE_G6_7', group_members: ALL5, map_variant: 'g07' },
  { id: 'g08', milestone_id: 'm2', start_year: 2016, end_year: 2017, age_range: [13, 14], age_variant: 'AGE_G8_9', group_members: ALL5, map_variant: 'g08' },
  { id: 'g09', milestone_id: 'm2', start_year: 2017, end_year: 2018, age_range: [14, 15], age_variant: 'AGE_G8_9', group_members: ALL5, map_variant: 'g09' },
  { id: 'g10', milestone_id: 'm3', start_year: 2018, end_year: 2019, age_range: [15, 16], age_variant: 'AGE_G10_12', group_members: ALL5, map_variant: 'g10' },
  { id: 'g11', milestone_id: 'm3', start_year: 2019, end_year: 2020, age_range: [16, 17], age_variant: 'AGE_G10_12', group_members: ALL5, map_variant: 'g11' },
  { id: 'g12', milestone_id: 'm3', start_year: 2020, end_year: 2021, age_range: [17, 18], age_variant: 'AGE_G10_12', group_members: ALL5, map_variant: 'g12' },
];

/** `map_thcs` dùng chung lớp 6–9. Biến thể = bộ trang trí + preset ánh sáng (định nghĩa hình ảnh ở src/world/variants.ts). */
export const MAPS: MapDef[] = [{
  id: 'map_thcs',
  zones: [
    { zone_id: 'zone.thcs.classroom', name: 'Lớp học' },
    { zone_id: 'zone.thcs.yard', name: 'Sân trường' },
    { zone_id: 'zone.thcs.corridor', name: 'Hành lang' },
    { zone_id: 'zone.thcs.gate', name: 'Cổng trường' },
    { zone_id: 'zone.thcs.field', name: 'Bãi đất trống' },
    { zone_id: 'zone.thcs.base', name: 'Căn cứ bí mật' },
  ],
  variants: [
    { variant_id: 'g06', decor_set: 'g06', lighting_preset: 'morning_sun' },
    { variant_id: 'g07', decor_set: 'g07', lighting_preset: 'late_afternoon' },
    { variant_id: 'g07_end', decor_set: 'g07_end', lighting_preset: 'late_afternoon' },
    { variant_id: 'g07_rain', decor_set: 'g07', lighting_preset: 'rain_overcast' },
    { variant_id: 'g08', decor_set: 'g08', lighting_preset: 'morning_sun' },
    { variant_id: 'g08_night', decor_set: 'g08', lighting_preset: 'night_campfire' },
    { variant_id: 'g09', decor_set: 'g09', lighting_preset: 'morning_sun' },
    { variant_id: 'g09_night', decor_set: 'g09', lighting_preset: 'night_campfire' },
    { variant_id: 'g09_end', decor_set: 'g09_end', lighting_preset: 'golden_sunset' },
  ],
  // Vị trí lấy từ marker SPAWN_ trong file Blender của từng khu (tools/blender/world/map_thcs/).
  spawn_points: [
    { id: 'spawn.thcs.yard' }, { id: 'spawn.thcs.classroom' }, { id: 'spawn.thcs.corridor' },
    { id: 'spawn.thcs.gate' }, { id: 'spawn.thcs.field' }, { id: 'spawn.thcs.base' },
  ],
}];
