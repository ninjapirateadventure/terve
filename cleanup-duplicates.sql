-- Find and remove duplicate user_flashcards
-- Keep only the most recent entry for each user-word combination

WITH duplicates AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, word_id 
               ORDER BY updated_at DESC, created_at DESC
           ) as row_num
    FROM user_flashcards
)
DELETE FROM user_flashcards 
WHERE id IN (
    SELECT id 
    FROM duplicates 
    WHERE row_num > 1
);

-- Verify results
SELECT 
    COUNT(*) as total_flashcards,
    COUNT(DISTINCT word_id) as unique_words
FROM user_flashcards 
WHERE user_id = '2a745857-fe44-4d73-bcc0-3843e3d38b26';
