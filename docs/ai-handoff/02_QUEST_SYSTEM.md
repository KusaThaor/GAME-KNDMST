# 02_QUEST_SYSTEM — hệ quest và cách viết nội dung

Lập 16/11/2026 (audit cuối của Fable). Nguồn sự thật: `src/content/types.ts` và `src/systems/questEngine.ts`; tài liệu lệch code thì **code đúng**.

## 1. Kết luận
**Không cần khung quest mới.** Kiến trúc hiện tại đã là data-driven: thêm Main, Side, Daily, Ngày, chương, thoại, điều kiện và phần thưởng **chỉ bằng dữ liệu** trong `src/content/`, không sửa engine. Lưu/nạp tự động. Chỉ cần tránh các bẫy ở §6 (A-01, A-02 đã xử lý ở T-02).

| Nhu cầu | Làm được bằng dữ liệu? | Ghi chú |
|---|---|---|
| Main quest | Có | chuỗi `main_chain` của Ngày, chạy lần lượt |
| Side quest | Có | validator chặn bước đầu sai (A-02, T-02) |
| Daily quest | Có | khai một lần, dùng lại ở nhiều Ngày; mỗi Ngày làm 1 lần; bẫy A-05 |
| Nhiều chương | Có | chương là nhãn gom Ngày (`chapters.ts`); thứ tự chơi theo `release.ts` (A-11) |
| Thoại, tương tác | Có | `talk`, `interact`, `cutscene`, `choice` |
| Điều kiện mở, trigger, mục tiêu | Có | `available_when`, `appear_when`, trigger `interact`/`arrive`, `objective` |
| Điều kiện hoàn thành, tiến trình | Có | hết bước = xong quest; hết `main_chain` = xong Ngày |
| Lưu/nạp | Có, tự động | checkpoint ở ranh giới bước |
| Rẽ nhánh bước, NPC đổi chỗ, minigame thật, túi đồ | **Chưa** | A-15, A-06, A-07 |

## 2. Kiến trúc hiện tại
```
src/content/days/*.ts, hub.ts ─► pack.ts (CONTENT) ─► indexContent() ─► ContentIndex
                                                          │
validateContent() ◄── npm test, lúc mở game               ▼
                                              QuestEngine (src/systems/questEngine.ts)
   game.ts: proximity()/interact() ─ trigger('arrive'|'interact', id) ─►   │ đổi SaveState
   game.ts: presentStep()/phone  ─── complete(stepId, {option_id}) ────►   │ emit lên EventBus
                                                                           ▼
        AlbumModel (ô Album) · HubModel (kỷ vật, PDE) · ReleaseTracker · analytics · autosave
```
- Trạng thái quest: `locked → available → active → completed`; Side/Daily chưa xong khi kết Ngày → `missed`. Không có thất bại.
- Mỗi quest `active` có đúng một bước đang chờ (`QuestRecord.step_id`). Bước chạy lần lượt theo mảng `steps`.
- Bối cảnh: `hub` (quest có `scope: 'hub'`) hoặc `day` (`main_chain + side_quests + daily_pool` của Ngày).
- Chơi lại Ngày: trạng thái và flag nằm ở vùng riêng (`save.current.replay`), không ghi đè lần đầu.
- Event chính: `quest_started`, `step_activated`, `step_completed`, `quest_completed`, `main_chain_completed`, `day_end_prompt`, `day_completed`, `save_requested`.

### Loại bước (`Step.kind`) và ai hoàn thành
| kind | Hoàn thành khi | Nơi xử lý |
|---|---|---|
| `talk` (`with`) | bấm E cạnh NPC → hết thoại | `game.ts interact()` |
| `interact` (`target`, `lines?`) | bấm E ở điểm `itr.*` (hoặc click vật ở Hub) | `interact()`, `hubClick()` |
| `goto` (`target`) | đi vào bán kính điểm | `proximity()` — xong khi đang đứng trong bán kính và giao diện không khóa (A-01, T-02) |
| `collect` (`targets`, `count`) | bấm E đủ `count` điểm | engine; chưa hiện số đếm (A-07) |
| `place` (`target`) | bấm E ở điểm | engine |
| `cutscene` (`lines`) | tự hiện, hết thoại | `presentStep()` |
| `choice` (`options`) | tự hiện, người chơi chọn | `presentStep()` |
| `photo` (`mode`, `camera_id`, `subjects`, `album_entry_id`) | chụp và giữ ảnh | `runPhoto()` |
| `free` | tự hiện, bấm "đi tiếp" | `presentStep()` |
| `minigame` | **thẻ giả**, bấm xong | `presentStep()` (A-07) |
| `setFlag` | tự xong ngay | engine |
| `album_restore` | tự hiện thông báo | `presentStep()` |
| `phone_ui`, `compose_message` | chỉ ở Hub, qua điện thoại | `phoneOpenThread()`, `phoneSend()` |

## 3. Schema dùng lại (rút gọn từ `src/content/types.ts`)
```ts
interface Quest {
  id: string;                       // q_<m1|m2|m3|hub>_<main|side|daily|event|pd>_NN
  type: 'main' | 'side' | 'daily' | 'event' | 'pd';
  scope: 'm1' | 'm2' | 'm3' | 'hub';
  memory_day_id?: string;           // bắt buộc với main/side/event; Daily dùng chung thì bỏ
  title: string;
  owner: string; ownership_label: 'HUMAN_CANON' | 'HUMAN_DRAFT' | 'AI_ASSISTED' | 'AI_PROPOSED';
  status: ContentStatus; version: string;
  available_when?: Condition;       // Side/Daily/Hub; Main trong Ngày bỏ qua trường này
  steps: Step[];                    // id bước: <quest_id>.sNN
  parts?: { id; title; first_step_id }[];          // Event nhiều phần (checkpoint đầu phần)
  rewards?: { album_entry_ids?: string[]; flags?: Record<string, FlagValue> };
  blocks_main: boolean;             // side/daily luôn false
}
type Condition = { all: Condition[] } | { any: Condition[] } | { flag: string; equals?: FlagValue }
               | { quest: string } | { day: string } | { always: true };
interface DialogueLine { speaker: ActorRef | 'narrator'; text: string; when?: Condition; fallback?: string }
```
Chữ trong `text`: `{player_name}`, `{g:<khi nam>|<khi nữ>}`. Dòng tối đa ~90 ký tự, 2 dòng (validator nhắc).
Flag: `<scope>.<slug>` (ví dụ `m1.placeholder_tone`).

## 4. Ví dụ một quest (CHỈ LÀ MẪU — không thêm vào repo, không phải cốt truyện)
Side cho Ngày `d.g07.03`, dùng các ID đã có trong bản đồ và trong `interactables` của Ngày đó.
```ts
const P = '[PLACEHOLDER]';
const meta = { owner: 'TBD', ownership_label: 'AI_PROPOSED', status: 'DRAFT', version: 'v0.1' } as const;

export const sideExample: Quest = {
  ...meta, id: 'q_m1_side_03', type: 'side', scope: 'm1', memory_day_id: 'd.g07.03',
  title: `${P} Side mẫu 03`, blocks_main: false,
  available_when: { flag: 'm1.placeholder_tone' },            // mở sau khi đã chọn sắc thái ở Main
  steps: [
    // Bước đầu PHẢI là talk/interact/goto/collect/place (A-02; validator báo optional_quest_unstartable)
    { id: 'q_m1_side_03.s01', kind: 'talk', with: 'NPC_B', objective: `${P} Nghe NPC_B nhờ`, lines: [
      { speaker: 'NPC_B', text: `${P} NPC_B nhờ {player_name} một việc.` },
      { speaker: 'NPC_B', text: `${P} Câu riêng khi đã chọn kiểu hưởng ứng.`,
        when: { flag: 'm1.placeholder_tone', equals: 'playful' }, fallback: `${P} Câu chung.` },
    ] },
    { id: 'q_m1_side_03.s02', kind: 'collect', item: 'placeholder_item', count: 2,
      targets: ['itr.thcs.snack_cart', 'itr.thcs.marble_spot', 'itr.thcs.old_table'], objective: `${P} Tìm 2 trong 3 chỗ` },
    { id: 'q_m1_side_03.s03', kind: 'choice', choice_id: 'c_m1_side_03', about: ['NPC_B'],
      prompt: { speaker: 'NPC_B', text: `${P} NPC_B hỏi một câu.` },
      options: [
        { id: 'a', tone: 'gentle', text: `${P} Trả lời 1`, set_flags: { 'm1.placeholder_side03': 'a' } },
        { id: 'b', tone: 'curious', text: `${P} Trả lời 2`, set_flags: { 'm1.placeholder_side03': 'b' } },
      ] },
  ],
  rewards: { flags: { 'm1.placeholder_side03_done': true } },
};
```
Để quest này chạy, cần thêm ở cùng file Ngày:
1. `day.side_quests`: thêm `'q_m1_side_03'`; `quests`: thêm object trên.
2. (Tùy chọn) ô Album thưởng: một `MemoryFragment` `frag.d.g07.03.06` và một `AlbumEntry` `alb.d.g07.03.06` có `required_for_restore: false`, `unlock_quest_id: 'q_m1_side_03'`.
3. Mọi `target`/`with` phải có trong `day.interactables` / `day.npc_placements` (đã có sẵn ở Ngày này).

## 5. Hướng dẫn viết nội dung
### 5.1 Thêm quest vào Ngày đã có
1. Viết object `Quest` trong `src/content/days/<file Ngày>.ts`, thêm vào mảng `quests`.
2. Khai ID vào `day.main_chain` (đúng thứ tự), `day.side_quests` hoặc `day.daily_pool`.
3. Đích mới: thêm vào `day.interactables` (`itr.<map>.<slug>`) — **marker `ITR_` cùng ID phải có trong file Blender** của bản đồ; chỗ đứng NPC dùng marker `spot.*`. Danh sách marker đang có: `src/world/maps/map_thcs.index.json`. Thiếu marker → `npm run validate:world` báo lỗi (game vẫn chạy, đặt tạm quanh điểm xuất hiện).
4. Thưởng Album: ô có `unlock_quest_id`, hoặc `rewards.album_entry_ids`.
5. Kiểm: `npm test` → `npm run validate:world` → `npm run dev`, mở `/?play=1&day=<id Ngày>&step=<id bước>`.

### 5.2 Thêm Ngày, chương, quest ở Hub
- **Ngày mới:** làm đúng 6 bước ở `README.md` mục "Thêm một Ngày ký ức mới" (file `days/`, `pack.ts`, `release.ts`, `chapters.ts`, PDE `RESTORE` + `SHELF` trong `hub.ts`, biến thể nếu là năm học mới).
- **Chương:** thêm dòng trong `src/content/chapters.ts`. Chương không điều khiển tiến trình; thứ tự chơi là thứ tự `memory_day_ids` trong `release.ts`.
- **Daily dùng chung:** khai cùng một object trong mỗi file Ngày dùng nó (`pack.ts` gộp theo ID), không ghi `memory_day_id`.
- **Quest ở Hub (2026):** `type: 'pd'`, `scope: 'hub'` trong `HUB_QUESTS` (`src/content/hub.ts`). Tự bắt đầu khi `available_when` đạt, hoặc mở bằng PDE `{ kind: 'unlock_quest' }`. Bước dùng `phone_ui`, `compose_message`, `interact` (vật `itr.hub.*`), `cutscene`.
- **Việc xảy ra ở 2026 sau một Ngày:** `PresentDayEvent` trong `PDES` (`restore_page`, `shelf_artifact`, `add_fragment`, `unlock_quest`, `message`).
- **Nhân vật trong nội dung:** dùng vai `NPC_A…NPC_D`, không ghi `chr_*` (D-01 chưa chốt; bảng vai ở `src/content/cast.ts`).

### 5.3 Điểm nối khi cần mở rộng engine (chỉ làm khi nội dung đã duyệt cần)
| Cần | Sửa ở | Phát hiện |
|---|---|---|
| Loại bước mới | `Step` trong `types.ts` → `matchesWith()`/`complete()` trong `questEngine.ts` → `presentStep()` + `PRESENT` trong `game.ts` → UI `src/ui/game/` → luật trong `validate.ts` → bot `src/lab/gameTools.ts` → test | — |
| Bỏ qua bước theo điều kiện | `StepBase.when` + `finishStep()`/`startQuest()` | A-15 |
| NPC/vật theo bước | `NpcPlacement.when`/`Interactable.when` + `dayScene.ts` nghe `step_completed` | A-06 |
| Minigame thật | thay thẻ giả ở `GameUi.tsx`, giữ `actions.minigameDone()` | A-07 |
| Hiệu ứng vào ký ức | `registerTransitionFx()` trong `game.ts` | A-13 |

## 6. Bẫy khi viết (đọc trước khi viết quest)
1. **Side/Daily: bước đầu phải là `talk | interact | goto | collect | place`** (A-02, đã có luật). Engine chỉ khởi động Side/Daily khi người chơi làm đúng bước đầu trong thế giới; bước đầu là `cutscene`, `free`, `choice`, `photo`, `minigame`, `setFlag`, `phone_ui`, `compose_message` hay `album_restore` thì quest không bao giờ bắt đầu và cuối Ngày bị tính là bỏ lỡ. Validator báo **lỗi** `optional_quest_unstartable` (kèm ID quest và loại bước sai). **Cách sửa:** đổi bước đầu thành một hành động (nói chuyện với NPC, đi tới một điểm…) rồi dời bước cũ xuống làm bước sau. Chỉ xét bước đầu của Side/Daily; Main và quest Hub không bị luật này.
2. **Bước `goto` hoàn thành ngay khi người chơi đang đứng trong bán kính đích và giao diện không khóa** (A-01, đã sửa): kể cả đã đứng sẵn ở đó trước khi bước bắt đầu, hoặc vào bán kính lúc đang mở thoại/Menu rồi đóng lại — không cần đi ra rồi quay vào. Hệ quả cho tác giả: nếu đích `goto` nằm sát chỗ nhân vật đang nói chuyện, bước sẽ xong ngay khi thoại kết thúc; muốn người chơi thật sự phải *đi tới* thì đặt đích xa khỏi chỗ đứng của bước trước. Hai bước `goto` liên tiếp tới cùng một đích sẽ xong liền nhau.
3. **Không viết điều kiện `{ quest: <id Daily> }`** (A-05). Dùng `rewards.flags` của Daily rồi điều kiện theo flag.
4. Main trong Ngày chạy theo thứ tự `main_chain`; `available_when` của Main bị bỏ qua.
5. Dòng thoại có `when` theo flag bắt buộc có `fallback` (validator báo `callback_without_fallback`).
6. `photo`: `subjects` phải được đặt trong Ngày; `camera_id` phải có trong `day.cameras`; marker máy ảnh cần cặp `cam.*` + `cam.*.target`.
7. Mỗi Ngày đúng một kỷ vật; trang Album `page.<id Ngày>` cần ít nhất một ô `required_for_restore`.
8. Nội dung `AI_PROPOSED` phải có `[PLACEHOLDER]` ở mọi chữ và không được nằm trong bản `production`.
9. Các trường `hint`, `time_phases`, `transition_fx`, `rewards.fragment_ids`, `item` hiện **không có tác dụng** (A-07).
10. NPC đứng yên suốt Ngày; mỗi vai một chỗ đứng (A-06).
11. ID đã phát hành public thì không đổi (bản lưu tham chiếu theo ID; `reconcileSave` chỉ xử lý bước bị xóa).
