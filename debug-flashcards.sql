-- Debug script to understand the current state of flashcards
-- Run this to see exactly what's happening with your user's flashcards

SELECT 
    'OVERVIEW' as section,
    '' as details
UNION ALL

SELECT 
    'Total flashcards for user:' as section,
    COUNT(*)::text as details
FROM user_flashcards 
WHERE user_id = '2a745857-fe44-4d73-bcc0-3843e3d38b26'

UNION ALL

SELECT 
    'Unique words for user:' as section,
    COUNT(DISTINCT word_id)::text as details
FROM user_flashcards 
WHERE user_id = '2a745857-fe44-4d73-bcc0-3843e3d38b26'

UNION ALL

SELECT 
    'Total words in database:' as section,
    COUNT(*)::text as details
FROM words

UNION ALL

SELECT 
    'DUPLICATES ANALYSIS' as section,
    '' as details

UNION ALL

SELECT 
    'Word ID with duplicates:' as section,
    word_id as details
FROM user_flashcards 
WHERE user_id = '2a745857-fe44-4d73-bcc0-3843e3d38b26'
GROUP BY word_id 
HAVING COUNT(*) > 1

UNION ALL

SELECT 
    'CATEGORY BREAKDOWN' as section,
    '' as details

UNION ALL

SELECT 
    CONCAT('Category: ', category) as section,
    COUNT(*)::text as details
FROM user_flashcards 
WHERE user_id = '2a745857-fe44-4d73-bcc0-3843e3d38b26'
GROUP BY category
ORDER BY section;
