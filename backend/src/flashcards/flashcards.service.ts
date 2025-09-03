import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFlashcard, FlashcardCategory } from './user-flashcard.entity';
import { WordsService } from '@/words/words.service';
import { CEFRLevel } from '@/users/user.entity';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(UserFlashcard)
    private userFlashcardsRepository: Repository<UserFlashcard>,
    private wordsService: WordsService,
  ) {}

  async getUserFlashcards(userId: string, category?: FlashcardCategory): Promise<UserFlashcard[]> {
    const query = this.userFlashcardsRepository.createQueryBuilder('uf')
      .leftJoinAndSelect('uf.word', 'word')
      .where('uf.userId = :userId', { userId });
    
    if (category) {
      query.andWhere('uf.category = :category', { category });
    }
    
    return query.orderBy('uf.updatedAt', 'DESC').getMany();
  }

  async getCategoryCounts(userId: string) {
    const counts = await this.userFlashcardsRepository.createQueryBuilder('uf')
      .select('uf.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('uf.userId = :userId', { userId })
      .groupBy('uf.category')
      .getRawMany();

    const result = {
      [FlashcardCategory.LEARNING]: 0,
      [FlashcardCategory.WELL_KNOWN]: 0,
      [FlashcardCategory.TODO]: 0,
      [FlashcardCategory.NOT_INTERESTED]: 0,
    };

    counts.forEach(item => {
      result[item.category] = parseInt(item.count);
    });

    return result;
  }

  async moveToCategory(userId: string, wordId: string, category: FlashcardCategory): Promise<UserFlashcard> {
    let userFlashcard = await this.userFlashcardsRepository.findOne({
      where: { userId, wordId },
      relations: ['word']
    });

    if (!userFlashcard) {
      // Create new flashcard if it doesn't exist
      userFlashcard = this.userFlashcardsRepository.create({
        userId,
        wordId,
        category
      });
    } else {
      userFlashcard.category = category;
    }

    return this.userFlashcardsRepository.save(userFlashcard);
  }

  async initializeUserFlashcards(userId: string, cefrLevel: CEFRLevel = CEFRLevel.A1): Promise<void> {
    const existingCount = await this.userFlashcardsRepository.count({ where: { userId } });
    if (existingCount > 0) {
      console.log('User already has flashcards');
      return;
    }

    // Get the 100 most common words for the user's CEFR level and below
    const words = await this.wordsService.findMostCommon(100, cefrLevel);
    
    const flashcards = words.map(word => this.userFlashcardsRepository.create({
      userId,
      wordId: word.id,
      category: FlashcardCategory.LEARNING
    }));

    await this.userFlashcardsRepository.save(flashcards);
    console.log(`Initialized ${flashcards.length} flashcards for user ${userId}`);
  }

  async ensureLearningCategorySize(userId: string, targetSize: number = 100): Promise<void> {
    console.log(`🔍 ensureLearningCategorySize called for user ${userId}, target: ${targetSize}`);
    
    // Get actual count of unique words in learning category
    const learningCount = await this.userFlashcardsRepository
      .createQueryBuilder('uf')
      .where('uf.userId = :userId', { userId })
      .andWhere('uf.category = :category', { category: FlashcardCategory.LEARNING })
      .getCount();
    
    console.log(`📊 Current learning count: ${learningCount}`);

    if (learningCount >= targetSize) {
      console.log(`✅ Already has enough learning cards (${learningCount} >= ${targetSize})`);
      return;
    }

    const needed = targetSize - learningCount;
    console.log(`📝 Need to add: ${needed} words`);

    // Get ALL unique words that user already has in ANY category
    const existingUserWords = await this.userFlashcardsRepository
      .createQueryBuilder('uf')
      .select('DISTINCT uf.wordId', 'wordId')
      .where('uf.userId = :userId', { userId })
      .getRawMany();
    
    const existingWordIds = existingUserWords.map(item => item.wordId);
    console.log(`🔍 User already has ${existingWordIds.length} unique words in any category`);

    // Get total words in database
    const totalWordsInDb = await this.wordsService.wordsRepository.count();
    console.log(`📚 Total words in database: ${totalWordsInDb}`);

    // Check if we have enough words available
    const availableWordsCount = totalWordsInDb - existingWordIds.length;
    console.log(`🎯 Available words in database: ${availableWordsCount}`);
    
    if (availableWordsCount <= 0) {
      console.log('❌ No more new words available to add to learning category');
      console.log(`   - Total words in DB: ${totalWordsInDb}`);
      console.log(`   - User already has: ${existingWordIds.length}`);
      console.log(`   - Available words: ${availableWordsCount}`);
      console.log('💡 Suggestion: Add more words to the database or reduce the target learning size');
      return;
    }

    // Only try to add as many words as are actually available
    const wordsToAdd = Math.min(needed, availableWordsCount);
    console.log(`📝 Attempting to add: ${wordsToAdd} words (limited by availability)`);

    // Get available words that user doesn't have in any category yet
    const availableWordsQuery = this.wordsService.wordsRepository
      .createQueryBuilder('word')
      .orderBy('word.frequency', 'ASC'); // Most common first
    
    if (existingWordIds.length > 0) {
      availableWordsQuery.where('word.id NOT IN (:...existingWordIds)', { existingWordIds });
    }
    
    const availableWords = await availableWordsQuery.limit(wordsToAdd).getMany();
    console.log(`🎯 Found ${availableWords.length} available words to add`);
    
    if (availableWords.length > 0) {
      availableWords.forEach((word, index) => {
        console.log(`  ${index + 1}. ${word.finnish} (${word.english})`);
      });
      
      const newFlashcards = availableWords.map(word => this.userFlashcardsRepository.create({
        userId,
        wordId: word.id,
        category: FlashcardCategory.LEARNING
      }));

      try {
        await this.userFlashcardsRepository.save(newFlashcards);
        console.log(`✅ Successfully added ${newFlashcards.length} new words to learning category`);
      } catch (error) {
        console.error('❌ Error saving flashcards (possible duplicates):', error.message);
        // Try to save one by one to handle any constraint violations
        let successCount = 0;
        for (const flashcard of newFlashcards) {
          try {
            await this.userFlashcardsRepository.save(flashcard);
            successCount++;
          } catch (individualError) {
            console.warn(`⚠️ Skipped duplicate word: ${flashcard.wordId}`);
          }
        }
        console.log(`✅ Successfully added ${successCount} new words (${newFlashcards.length - successCount} were duplicates)`);
      }
    } else {
      console.log('❌ No available words found to add');
    }

    // Final report
    const finalLearningCount = await this.userFlashcardsRepository
      .createQueryBuilder('uf')
      .where('uf.userId = :userId', { userId })
      .andWhere('uf.category = :category', { category: FlashcardCategory.LEARNING })
      .getCount();
    
    console.log(`🎉 Final learning category size: ${finalLearningCount}`);
  }

  async getRandomLearningCard(userId: string): Promise<UserFlashcard | null> {
    const learningCards = await this.getUserFlashcards(userId, FlashcardCategory.LEARNING);
    if (learningCards.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * learningCards.length);
    return learningCards[randomIndex];
  }

  async updateReviewStats(flashcardId: string, wasCorrect: boolean): Promise<UserFlashcard> {
    const flashcard = await this.userFlashcardsRepository.findOne({ 
      where: { id: flashcardId },
      relations: ['word'] 
    });
    
    if (!flashcard) {
      throw new Error('Flashcard not found');
    }

    flashcard.timesReviewed += 1;
    if (wasCorrect) {
      flashcard.timesCorrect += 1;
    }
    flashcard.lastReviewedAt = new Date();

    return this.userFlashcardsRepository.save(flashcard);
  }

  // Helper method to clean up duplicates
  async cleanupDuplicates(userId: string): Promise<{ removed: number }> {
    console.log(`🧹 Cleaning up duplicate flashcards for user ${userId}`);
    
    // Find duplicates (same user_id and word_id)
    const duplicates = await this.userFlashcardsRepository
      .createQueryBuilder('uf')
      .select(['uf.id', 'uf.wordId', 'uf.userId', 'uf.createdAt', 'uf.updatedAt'])
      .where('uf.userId = :userId', { userId })
      .orderBy('uf.updatedAt', 'DESC')
      .addOrderBy('uf.createdAt', 'DESC')
      .getMany();

    const seen = new Set<string>();
    const toRemove: string[] = [];
    
    for (const flashcard of duplicates) {
      const key = `${flashcard.userId}-${flashcard.wordId}`;
      if (seen.has(key)) {
        toRemove.push(flashcard.id);
      } else {
        seen.add(key);
      }
    }

    if (toRemove.length > 0) {
      await this.userFlashcardsRepository.delete(toRemove);
      console.log(`🗑️ Removed ${toRemove.length} duplicate flashcards`);
    }

    return { removed: toRemove.length };
  }
}
