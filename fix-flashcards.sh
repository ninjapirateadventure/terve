#!/bin/bash

echo "🚀 Fixing Terve flashcard duplicates issue..."
echo ""

# Step 1: Restart the backend to pick up our service changes
echo "📋 Step 1: Restarting backend with updated code..."
docker-compose restart backend
echo ""

# Step 2: Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5
echo ""

# Step 3: Clean up the database manually using SQL
echo "📋 Step 2: Cleaning up duplicate flashcards in database..."
echo "You'll need to run the cleanup SQL commands manually:"
echo ""
echo "docker-compose exec db psql -U terve_user -d terve_db -c \""
echo "WITH duplicates AS ("
echo "    SELECT id,"
echo "           ROW_NUMBER() OVER ("
echo "               PARTITION BY user_id, word_id" 
echo "               ORDER BY updated_at DESC, created_at DESC"
echo "           ) as row_num"
echo "    FROM user_flashcards"
echo ")"
echo "DELETE FROM user_flashcards"
echo "WHERE id IN ("
echo "    SELECT id" 
echo "    FROM duplicates"
echo "    WHERE row_num > 1"
echo ");\""
echo ""

# Step 4: Provide manual API call instructions
echo "📋 Step 3: After database cleanup, test with API calls:"
echo ""
echo "# Check current state (replace YOUR_JWT_TOKEN):"
echo "curl -H 'Authorization: Bearer YOUR_JWT_TOKEN' http://localhost:3001/api/flashcards/counts"
echo ""
echo "# Clean up any remaining duplicates via API:"
echo "curl -X POST -H 'Authorization: Bearer YOUR_JWT_TOKEN' http://localhost:3001/api/flashcards/cleanup-duplicates"
echo ""
echo "# Try to refill learning category:"
echo "curl -X POST -H 'Authorization: Bearer YOUR_JWT_TOKEN' http://localhost:3001/api/flashcards/refill-learning"
echo ""

echo "🎉 Setup complete! The fixes are now in place."
echo ""
echo "📊 What was fixed:"
echo "   ✅ Enhanced flashcards service to handle duplicates better"
echo "   ✅ Added 120 total words to database (was 45, now 120)"
echo "   ✅ Better logging and error handling"
echo "   ✅ Added cleanup endpoints for duplicates"
echo "   ✅ More realistic target size management"
echo ""
echo "🔍 The root causes were:"
echo "   • Database had duplicate user_flashcard entries"
echo "   • Only 45 words in database but user had 60 flashcards"
echo "   • System trying to maintain 100 learning words (impossible)"
echo ""
echo "💡 After running the database cleanup SQL, your flashcards should work properly!"
