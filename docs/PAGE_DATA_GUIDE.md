# PAGE_DATA_GUIDE — cấu trúc file dữ liệu một Trang (cho đội nội dung số hóa Trang 2–9)

Lập 21/11/2026 trên nhánh `feat/sprint-0412`. Nguồn: `src/content/types.ts`, `src/content/days/d_g07_03.ts`, `README.md` mục "Thêm một Ngày ký ức mới".

**Lưu ý tên gọi:** GDD v1.0 gọi đơn vị chơi là **Trang** (`page_id = d.gNN.KK`); trong code gọi là **Ngày** (`MemoryDay`, thư mục `src/content/days/`). Hai tên là một. Không có `src/data/pages/`; đường dẫn thật là `src/content/days/`. Giữ nguyên để khỏi đổi schema và import. Ở event đo lường, `page_id` chính là `day.id`.

## 1. Mỗi Trang = một file `src/content/days/d_gNN_KK.ts`
Chép từ `d_g07_03.ts` (đủ bộ nhất). File xuất đúng 5 thứ:

| Xuất | Kiểu | Chứa gì | Ví dụ ở Trang 4 |
|---|---|---|---|
| `day` | `MemoryDay` | ID Trang, năm học, bản đồ, khu mở, chỗ đứng NPC, điểm tương tác, máy ảnh ảo, chuỗi Main/Side/Daily, trang Album | `id: 'd.g07.03'`, `main_chain: ['q_m1_main_05']` |
| `quests` | `Quest[]` | Main/Side/Daily của Trang; mỗi quest gồm các bước (`steps`) | `q_m1_main_05` (5 bước), `q_m1_side_02` |
| `artifact` | `Artifact` | Đúng **một** kỷ vật dẫn vào Trang; điều kiện sáng lên | `art_m1_05`, `appear_when: { day: 'd.g06.01' }` |
| `fragments` | `MemoryFragment[]` | Mảnh ký ức: ảnh, chữ mặt sau, kỷ vật, sticker | `frag.d.g07.03.01…05` |
| `entries` | `AlbumEntry[]` | Ô của trang Album; ít nhất một ô `required_for_restore: true` | `alb.d.g07.03.01…05` |

## 2. Khung `day` (phần cần điền)
```
id                 'd.gNN.KK'  (khớp bảng 9 Trang, GDD 00 §2.2)
title              tên Trang (hiện cho người chơi)
school_year_id     'g06' | 'g07' | 'g08' | 'g09'
map_id, map_variant  'map_thcs' + biến thể theo năm học
open_zones         các khu mở: zone.thcs.classroom | corridor | yard | gate | field | base
spawn_point        'spawn.thcs.<khu>'
anchor_artifact_id kỷ vật dẫn vào
main_chain / side_quests / daily_pool    danh sách ID quest
npc_placements     [{ actor: 'NPC_A'…'NPC_D', marker: 'spot.thcs.…', motion: 'idle' }]  (không ghi thẳng chr_*)
interactables      [{ id: 'itr.thcs.<tên>', label, zone_id, kind: 'object' | 'marker' }]
cameras            [{ id: 'cam.<…>', marker: 'cam.thcs.…', fov }]  (cho bước ảnh)
album_page_id, completion
```

## 3. Các loại bước (`steps`) trong một quest
| `kind` | Dùng cho (kiểu K1–K6, GDD 00 §3.3) | Trường chính |
|---|---|---|
| `talk` | K1 nói chuyện | `with`, `lines[]` (mỗi dòng có `speaker`, `text`, tùy chọn `when` + `fallback`) |
| `choice` | K1 chọn 1 trong 2–3 câu | `choice_id`, `options[]` (mỗi lựa chọn có `tone`: `playful`/`gentle`/`deep`, `set_flags`), `measured` |
| `interact`, `goto`, `collect`, `place` | K1/K3 | `target` (ID điểm tương tác) |
| `photo` | K2 chụp ảnh | `mode` (`timer`…), `camera_id`, `subjects`, `album_entry_id`, `stand_zone` |
| `cutscene` | Mở/kết cảnh, thẻ chữ thời gian | `lines[]` |
| `minigame` | Caro, Sudoku, lật chai… | `game` (ví dụ `caro`), `level` — **khung thật chưa có**, hiện là thẻ giả |
| `free`, `album_restore` | Đi lại tự do; phục hồi trang Album | `prompt` |
| `phone_ui`, `compose_message` | Màn điện thoại, tin nhắn kết demo (chỉ ở Hub) | `thread_id`, `openers[]` (3 sắc thái `playful`/`gentle`/`deep`) |

Thoại: lời thoại dùng `{player_name}` cho tên Player. Dòng có điều kiện (`when`) phải có `fallback`.

## 4. Quy tắc đặt ID
| Thứ | Mẫu | Ví dụ |
|---|---|---|
| Trang | `d.gNN.KK` | `d.g08.01` |
| Quest | `q_<m1\|m2>_<main\|side\|daily>_NN` | `q_m2_main_01` |
| Bước | `<quest_id>.sNN` | `q_m2_main_01.s03` |
| Kỷ vật | `art_<mốc>_NN` | `art_m2_01` |
| Mảnh | `frag.<trang>.NN` | `frag.d.g08.01.02` |
| Ô Album | `alb.<trang>.NN` | `alb.d.g08.01.01` |
| Điểm tương tác | `itr.thcs.<tên>` | `itr.thcs.chalk_box` |
| Máy ảnh | `cam.<…>.<…>` | `cam.d0801.board` |

Side/Daily phải có `blocks_main: false` và bước đầu thuộc `talk | interact | goto | collect | place` (engine chỉ khởi động Side/Daily qua các loại này; validator chưa chặn — xem A-02 trong `docs/ai-handoff/04_NEXT_TASK_FOR_CLAUDE.md`). ID đã phát hành public thì không đổi. Mã `d.g06.02` không dùng lại (đã gộp vào Trang 1).

## 5. Cắm Trang mới vào game (4 chỗ ngoài file Trang)
1. `src/content/pack.ts` — thêm `import * as dXXXX from './days/…'` và thêm vào mảng `DAYS`.
2. `src/content/release.ts` — thêm ID vào `memory_day_ids` của bản `test` (bản `production` chỉ nhận nội dung đã duyệt, không có `[PLACEHOLDER]`).
3. `src/content/chapters.ts` — thêm ID vào nhóm Mốc tương ứng (nhãn "Mốc 1 · lớp 7", "Mốc 2 · lớp 8"…).
4. `src/content/hub.ts` — thêm Present-day Event: một `RESTORE` (phục hồi trang) và một `SHELF` (kỷ vật lên kệ) với `trigger: { day: '<ID Trang>' }`.
Nếu cần năm học/biến thể mới: `MAPS` trong `src/content/base.ts` và `src/world/variants.ts`.

## 6. Kiểm
```bash
npm test                         # validator báo ID lệch mẫu, tham chiếu không tồn tại, trùng ID
npm run validate:world           # marker/khu của bản đồ
npm run dev                      # mở /?play=1&day=<ID Trang> để vào thẳng Trang đó
```

## 7. Phân công nội dung Trang 2–9 (đối chiếu GDD 00 §2.2)
| Trang | Mã | Tên | Thứ nhất cần có |
|---|---|---|---|
| 2 | `d.g07.01` | Thuyền giấy dưới mái hiên | rãnh nước (Z02b), đua thuyền (K5) |
| 3 | `d.g07.02` | Căn cứ bí mật | khu `zone.thcs.base`, biển tên, sổ luật |
| 5 | `d.g08.01` | Lên lớp 8 (có ván caro) | hộp phấn KV-01, bước `minigame` `caro` |
| 6 | `d.g08.02` | Confession | ghế đá sân, màn 2D confession |
| 7 | `d.g09.01` | Tờ báo tường cuối cùng | bước `minigame` `sudoku` (đồng hồ 6 phút) |
| 8 | `d.g09.02` | Rã băng | Hội trại, sân biến thể đêm |
| 9 | `d.g09.03` | Vẫn đủ năm đứa | sổ lưu bút |

Thoại nguyên văn nằm ở `docs/gdd/scripts/KICH_BAN_DEMO_M1_M2_v1.md` (v1.4). Khi thoại ở file `01_NARRATIVE_AND_SCENES.md` khác kịch bản này, kịch bản thắng.
