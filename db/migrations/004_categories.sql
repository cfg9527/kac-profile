-- KPP-5: widen entries.category. Idempotent. Apply manually after review; never from CI.
BEGIN;
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_category_check;
ALTER TABLE entries ADD CONSTRAINT entries_category_check CHECK (category IN (
  '華語流行','西方搖滾','電子Hip-Hop','參考資料','分冊目錄',
  '爵士','J-Pop','K-pop','古典','東南亞','跨界'));
COMMIT;
