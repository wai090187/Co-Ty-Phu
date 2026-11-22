# Plan Fix — Co-Ty-Phu

## 1. Tóm tắt đánh giá

Repository là ứng dụng React + TypeScript mô phỏng board game kiểu Cờ tỷ phú với:

- Bộ khung Vite/Tailwind
- Quản lý trạng thái bằng React hooks
- Dữ liệu thẻ, ô cờ, nhân vật, kỹ năng lưu trong IndexedDB/localStorage
- Nhiều module turn, movement, card, property, jail, investigator và AI
- Bộ test logic chạy bằng `npx tsx scripts/test_abilities_logic.ts`

Các rủi ro nghiêm trọng nhất thuộc nhóm bất đồng bộ React, save/load, vi phạm invariant trạng thái và luồng luân phiên người chơi.

---

## 2. Các lỗi logic có khả năng cao

### P0-1. Trạng thái trò chơi có thể bị stale do bất đồng bộ React

Các hook chính:

- `useMonopolyGame.ts`
- `useGameState.ts`
- `useMovementController.ts`
- `useTileLandingResolver.ts`

dùng nhiều setter trực tiếp và callback liên kết chặt.

**Rủi ro**

- Một hành động có thể đọc state cũ trong cùng render.
- Các lệnh `setPlayers`, `setTiles`, `setCanRoll`, `setTurnIndex` liên tiếp có thể ghi đè cập nhật.
- Timeout animation có thể tiếp tục chạy sau khi người chơi reset hoặc thoát game.

**Kết quả**

- Tiền nhân đôi hoặc bị trừ sai trong luồng move/bankruptcy.
- Thẻ hoặc bất động sản có thể ghi đè state cũ.
- Vòng turn có thể bỏ qua người chơi hoặc kích hoạt hai lần.

**Fix**

- Dùng functional setter cho mọi update phụ thuộc state trước đó.
- Gom thay đổi turn/property/cash trong một transaction/invariant.
- Hủy timeout và interval khi unmount/reset.
- Không để callback giữ state cũ quá một render.

---

### P0-2. Save/load chưa đủ validation

File: `src/modules/game/hooks/useSaveGame.ts`

**Rủi ro**

- JSON parse chỉ kiểm tra một số kiểu dữ liệu.
- Không có version/schema migration.
- Không kiểm tra phần tử trong `players`, `tiles`, `decks`, `abilities`.
- Save/load lưu cả dữ liệu animation/tạm thời không nhất quán.

**Kết quả**

- Load save lỗi có thể làm ứng dụng crash.
- Save cũ có thể phá render khi thiếu field mới.
- Có thể load save với âm tiền hoặc không còn người chơi hợp lệ.

**Fix**

- Thêm `SAVE_SCHEMA_VERSION`.
- Validate toàn bộ save bằng một schema validator.
- Thêm migration theo từng version.
- Chỉ cho load save vượt qua validator.
- Clone dữ liệu mặc định thay vì mutate object trong save.

---

### P0-3. Bankruptcy chưa phải là một transaction hoàn chỉnh

Files:

- `useTileLandingResolver.ts`
- `useGameState.ts`
- `useTurnManager.ts`

**Rủi ro**

- Bankruptcy chuyển tài sản cho creditor hoặc nhà đầu tư theo luồng khác nhau.
- Khi không có creditor, tài sản được reset.
- Turn tiếp theo chỉ bỏ qua người có `bankrupt === true`.

**Cần kiểm chứng**

- Người phá sản có tài sản mortgage trước khi reset.
- `houses` và `mortgaged` không bị nhân bản hoặc mất.
- Bank nhận lại tài sản khi không có creditor.
- Chỉ có một người sống ở cuối trận.

**Fix**

- Tách `bankruptPlayer(playerId, creditorId?)` thành action duy nhất.
- Truyền house/hotel/mortgage status sang creditor theo contract rõ ràng.
- Chỉ chạy winner check sau khi state bankruptcy đã commit.

---

### P0-4. Movement skipping có thể tính GO bonus sai

File: `src/modules/game/hooks/useMovementController.ts`

**Rủi ro**

- `skipMovement` và movement từng bước có thể cộng GO bonus bằng hai con đường khác nhau.
- Có thể cộng hai lần khi vừa vượt GO vừa kết thúc tại ô 0.
- Quay ngược có thể nhầm với GO bonus.

**Fix**

- Tách hai khái niệm: `crossedGoCount` và `landedExactlyOnGo`.
- Với forward movement:

```ts
const crossings =
  Math.floor((oldPos + distance) / 40) -
  Math.floor(oldPos / 40);
```

- Cộng GO bonus một lần cho mỗi crossing.
- Không cộng GO bonus cho backward movement trừ luật ability ghi rõ.

---

### P1-1. Jail/Investigator có nhiều luồng return khác nhau

Files:

- `useMovementController.ts`
- `useOutOfJailAction.ts`
- `useTurnManager.ts`
- `useTileLandingResolver.ts`
- `jailRollHelper.ts`

**Rủi ro**

- Điểm ra tù có thể được cập nhật bởi roll, card hoặc ability.
- Investigator turn bổ sung logic riêng.
- Không có state jail transaction hóa.

**Fix**

- Chuẩn hóa trạng thái jail:

```ts
interface JailState {
  type: "not_in_jail" | "jail";
  turnsRemaining?: number;
  source?: "normal" | "investigator";
}
```

- Mỗi action chỉ đổi jail state theo reducer.
- Giới hạn 3 lần attempt.
- Chỉ cho phép roll theo đúng luật hiện tại.

---

### P1-2. Double roll và extra roll có thể không được reset nhất quán

File: `src/modules/game/hooks/useMovementController.ts`

**Rủi ro**

- `consecutiveDoubles`, `hasPendingExtraRoll`, `canRoll`, `isRolling`, `isMovingStepByStep` là nhiều nguồn truth.

**Fix**

- Gom thành state machine:

```ts
type TurnPhase =
  | "idle"
  | "rolling"
  | "moving"
  | "resolving_tile"
  | "awaiting_action"
  | "ended";
```

- Chỉ `endTurn()` được phép reset roll/double state.
- Double lần 3 ưu tiên jail hơn extra roll.

---

### P1-3. AI loop có thể chạy ngoài luồng turn

File: `src/modules/game/hooks/useAIBotTurn.ts`

**Rủi ro**

- Timeout/interval có thể chạy sau thay đổi active player.
- AI có thể purchase/build/use ability khi không đến lượt.
- `isModalActive` có thể không đồng bộ.

**Fix**

- Verify `activePlayer.id === aiPlayerId` trước action.
- Bọc AI loop trong `turnId`.
- Khi turn đổi, hủy timer cũ.
- Không cho AI mutate state nếu modal đang mở.

---

### P1-4. Card deck có thể thiếu shuffle và duplicate rules

Files:

- `src/data/cards.ts`
- `useCardActions.ts`
- `cardDeckHelper.ts`

**Rủi ro**

- Reset deck có thể phục hồi custom deck.
- Custom card/cheat card có thể làm sai phân phối.

**Fix**

- Dữ liệu deck gốc phải immutable.
- Custom deck phải seed riêng.
- Không mutate card trong state.
- Test draw/pick không lặp vô hạn khi deck rỗng.

---

### P1-5. Storage cache và persistent database không nhất quán

Files:

- `abilitiesDb.ts`
- `userConfigDb.ts`
- `useGameState.ts`

**Rủi ro**

- Cache settings có thể không khớp IndexedDB.
- JSON parse/localStorage có thể throw.
- Giá trị mặc định không migrate.

**Fix**

- Mỗi storage module export `loadX()`, `saveX()`, `resetX()`, `validateX()`.
- Tách cache khỏi persistent source.
- Catch và fallback về default schema.
- Xóa cache tương ứng khi reset ability.

---

## 3. Phase triển khai

### Phase 1 — Test hạ tầng và bảo vệ invariant

- Thêm test runner tập trung.
- Test:
  - Move forward/backward
  - GO bonus
  - skip movement
  - jail
  - double
  - bankruptcy
  - winner
  - save/load
- Thêm invariant checker:

```ts
assertPlayersUnique();
assertPositionsInRange();
assertNoNegativeCash();
assertNoDuplicateOwnership();
assertExactlyOneWinnerIfGameOver();
```

### Phase 2 — Chuẩn hóa game state

- Rà lại `useGameState.ts`.
- Gom turn và movement state thành reducer.
- Loại bỏ side effect trong render.
- Thêm `gamePhase`, `turnId`, `actionSequenceId`.

### Phase 3 — Refactor movement

- Viết lại `useMovementController.ts`.
- Đảm bảo mỗi bước được queue theo thứ tự.
- `skipMovement` dùng công thức modulo rõ ràng.
- Cộng GO bonus đúng một lần.

### Phase 4 — Refactor jail và turn

- Chuẩn hóa jail state.
- Viết reducer cho roll/double/extra roll.
- Viết lại `endTurn`.
- Test investigator và normal jail riêng biệt.

### Phase 5 — Bankrupt và victory

- Tách bankruptcy thành transaction riêng.
- Phân tài sản cho creditor.
- Reset tài sản khi không có creditor.
- Chỉ check winner sau khi commit bankruptcy.

### Phase 6 — Save/load migration

- Thêm schema version.
- Validation trước load.
- Migration chain.
- Test backward-compatible save.
- Không load save nếu thiếu dữ liệu bắt buộc.

### Phase 7 — AI và asynchronous cleanup

- Rà toàn bộ timers trong movement và AI.
- Thêm cancellation theo `turnId`.
- Hủy timer khi modal mở/reset/unmount.
- Test AI không chạy ngoài lượt.

### Phase 8 — End-to-end verification

- Chạy build và test.
- Test browser theo luồng thật.
- Export log và kiểm tra sequence.
- Chạy matrix 2–6 người chơi.
- Chạy AI easy/medium/hard.
- Chạy repeat test để phát hiện race condition.

---

## 4. Kiểm tra ưu tiên ngay

1. Save/load có crash hoặc không khi load JSON cũ.
2. Skip movement có cộng GO bonus sai không.
3. Double 3 lần có vào tù đúng không.
4. Bankruptcy có chuyển tài sản đúng không.
5. Winner được đặt khi có hơn một survivor không.
6. AI có chạy sau khi end turn không.
7. GO +1 và GO +2 có cộng đúng bonus không.
8. Return-to-main-menu có clear timer không.

---

## 5. Definition of Done

- Không còn thao tác mutation làm sai game state.
- Không có timeout hoặc interval sống sau khi reset.
- Save/load cũ load được hoặc báo lỗi rõ ràng.
- Không có cash âm ngoài xử lý bankruptcy.
- Không có property trùng owner.
- Luôn có đúng 0 hoặc 1 winner.
- Toàn bộ test P0/P1 pass lặp lại ít nhất 10 lần.
- Build TypeScript pass bằng `npm run lint` và `npm run build`.
