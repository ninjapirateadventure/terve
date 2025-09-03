import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word } from './word.entity';
import { CEFRLevel } from '@/users/user.entity';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    public wordsRepository: Repository<Word>, // Made public for flashcards service
  ) {}

  async findAll(): Promise<Word[]> {
    return this.wordsRepository.find();
  }

  async findByCefrLevel(cefrLevel: CEFRLevel): Promise<Word[]> {
    return this.wordsRepository.find({
      where: { cefrLevel },
      order: { frequency: 'ASC' } // Most common words first
    });
  }

  async findMostCommon(limit: number = 100, cefrLevel?: CEFRLevel): Promise<Word[]> {
    const query = this.wordsRepository.createQueryBuilder('word')
      .orderBy('word.frequency', 'ASC')
      .limit(limit);
    
    if (cefrLevel) {
      query.where('word.cefrLevel = :cefrLevel', { cefrLevel });
    }
    
    return query.getMany();
  }

  async create(wordData: Partial<Word>): Promise<Word> {
    const word = this.wordsRepository.create(wordData);
    return this.wordsRepository.save(word);
  }

  async seedBasicWords(): Promise<void> {
    const existingCount = await this.wordsRepository.count();
    if (existingCount > 0) {
      console.log('Words already seeded');
      return;
    }

    const basicWords = [
      // A1 Level - Most Essential Words
      { finnish: 'hei', english: 'hello', phonetic: 'hey', cefrLevel: CEFRLevel.A1, frequency: 1, category: 'greetings' },
      { finnish: 'kiitos', english: 'thank you', phonetic: 'kee-tos', cefrLevel: CEFRLevel.A1, frequency: 2, category: 'greetings' },
      { finnish: 'anteeksi', english: 'excuse me/sorry', phonetic: 'an-teek-si', cefrLevel: CEFRLevel.A1, frequency: 3, category: 'greetings' },
      { finnish: 'kyllä', english: 'yes', phonetic: 'kyl-lah', cefrLevel: CEFRLevel.A1, frequency: 4, category: 'basic' },
      { finnish: 'ei', english: 'no', phonetic: 'ay', cefrLevel: CEFRLevel.A1, frequency: 5, category: 'basic' },
      { finnish: 'minä', english: 'I', phonetic: 'mi-nah', cefrLevel: CEFRLevel.A1, frequency: 6, category: 'pronouns' },
      { finnish: 'sinä', english: 'you', phonetic: 'si-nah', cefrLevel: CEFRLevel.A1, frequency: 7, category: 'pronouns' },
      { finnish: 'hän', english: 'he/she', phonetic: 'hahn', cefrLevel: CEFRLevel.A1, frequency: 8, category: 'pronouns' },
      { finnish: 'olla', english: 'to be', phonetic: 'ol-la', cefrLevel: CEFRLevel.A1, frequency: 9, category: 'verbs' },
      { finnish: 'yksi', english: 'one', phonetic: 'yk-si', cefrLevel: CEFRLevel.A1, frequency: 10, category: 'numbers' },
      { finnish: 'kaksi', english: 'two', phonetic: 'kak-si', cefrLevel: CEFRLevel.A1, frequency: 11, category: 'numbers' },
      { finnish: 'kolme', english: 'three', phonetic: 'kol-me', cefrLevel: CEFRLevel.A1, frequency: 12, category: 'numbers' },
      { finnish: 'vesi', english: 'water', phonetic: 'veh-si', cefrLevel: CEFRLevel.A1, frequency: 13, category: 'food' },
      { finnish: 'ruoka', english: 'food', phonetic: 'ruo-ka', cefrLevel: CEFRLevel.A1, frequency: 14, category: 'food' },
      { finnish: 'kahvi', english: 'coffee', phonetic: 'kah-vi', cefrLevel: CEFRLevel.A1, frequency: 15, category: 'food' },
      { finnish: 'koti', english: 'home', phonetic: 'ko-ti', cefrLevel: CEFRLevel.A1, frequency: 16, category: 'places' },
      { finnish: 'työ', english: 'work', phonetic: 'tyo', cefrLevel: CEFRLevel.A1, frequency: 17, category: 'daily_life' },
      { finnish: 'koulu', english: 'school', phonetic: 'kou-lu', cefrLevel: CEFRLevel.A1, frequency: 18, category: 'places' },
      { finnish: 'aika', english: 'time', phonetic: 'ai-ka', cefrLevel: CEFRLevel.A1, frequency: 19, category: 'basic' },
      { finnish: 'päivä', english: 'day', phonetic: 'pai-va', cefrLevel: CEFRLevel.A1, frequency: 20, category: 'time' },
      
      // More A1 words
      { finnish: 'yö', english: 'night', phonetic: 'yo', cefrLevel: CEFRLevel.A1, frequency: 21, category: 'time' },
      { finnish: 'mies', english: 'man', phonetic: 'mi-es', cefrLevel: CEFRLevel.A1, frequency: 22, category: 'people' },
      { finnish: 'nainen', english: 'woman', phonetic: 'nai-nen', cefrLevel: CEFRLevel.A1, frequency: 23, category: 'people' },
      { finnish: 'lapsi', english: 'child', phonetic: 'lap-si', cefrLevel: CEFRLevel.A1, frequency: 24, category: 'people' },
      { finnish: 'isä', english: 'father', phonetic: 'i-sah', cefrLevel: CEFRLevel.A1, frequency: 25, category: 'family' },
      { finnish: 'äiti', english: 'mother', phonetic: 'ai-ti', cefrLevel: CEFRLevel.A1, frequency: 26, category: 'family' },
      { finnish: 'iso', english: 'big', phonetic: 'i-so', cefrLevel: CEFRLevel.A1, frequency: 27, category: 'adjectives' },
      { finnish: 'pieni', english: 'small', phonetic: 'pi-e-ni', cefrLevel: CEFRLevel.A1, frequency: 28, category: 'adjectives' },
      { finnish: 'hyvä', english: 'good', phonetic: 'hy-vah', cefrLevel: CEFRLevel.A1, frequency: 29, category: 'adjectives' },
      { finnish: 'paha', english: 'bad', phonetic: 'pa-ha', cefrLevel: CEFRLevel.A1, frequency: 30, category: 'adjectives' },

      // A2 Level words
      { finnish: 'opiskella', english: 'to study', phonetic: 'o-pis-kel-la', cefrLevel: CEFRLevel.A2, frequency: 31, category: 'verbs' },
      { finnish: 'puhua', english: 'to speak', phonetic: 'pu-hua', cefrLevel: CEFRLevel.A2, frequency: 32, category: 'verbs' },
      { finnish: 'ymmärtää', english: 'to understand', phonetic: 'ym-mar-taa', cefrLevel: CEFRLevel.A2, frequency: 33, category: 'verbs' },
      { finnish: 'tietää', english: 'to know', phonetic: 'ti-e-taa', cefrLevel: CEFRLevel.A2, frequency: 34, category: 'verbs' },
      { finnish: 'kieli', english: 'language', phonetic: 'ki-e-li', cefrLevel: CEFRLevel.A2, frequency: 35, category: 'education' },
      { finnish: 'ystävä', english: 'friend', phonetic: 'ys-ta-va', cefrLevel: CEFRLevel.A2, frequency: 36, category: 'people' },
      { finnish: 'kaupunki', english: 'city', phonetic: 'kau-pun-ki', cefrLevel: CEFRLevel.A2, frequency: 37, category: 'places' },
      { finnish: 'maa', english: 'country', phonetic: 'maa', cefrLevel: CEFRLevel.A2, frequency: 38, category: 'places' },
      { finnish: 'kaunis', english: 'beautiful', phonetic: 'kau-nis', cefrLevel: CEFRLevel.A2, frequency: 39, category: 'adjectives' },
      { finnish: 'viikko', english: 'week', phonetic: 'viik-ko', cefrLevel: CEFRLevel.A2, frequency: 40, category: 'time' },

      // B1 Level words  
      { finnish: 'keskustella', english: 'to discuss', phonetic: 'kes-kus-tel-la', cefrLevel: CEFRLevel.B1, frequency: 41, category: 'verbs' },
      { finnish: 'päättää', english: 'to decide', phonetic: 'paat-taa', cefrLevel: CEFRLevel.B1, frequency: 42, category: 'verbs' },
      { finnish: 'kokea', english: 'to experience', phonetic: 'ko-ke-a', cefrLevel: CEFRLevel.B1, frequency: 43, category: 'verbs' },
      { finnish: 'yhteiskunta', english: 'society', phonetic: 'yh-teis-kun-ta', cefrLevel: CEFRLevel.B1, frequency: 44, category: 'society' },
      { finnish: 'kulttuuri', english: 'culture', phonetic: 'kult-tu-u-ri', cefrLevel: CEFRLevel.B1, frequency: 45, category: 'society' },

      // Additional A1 words to reach 120+ total
      { finnish: 'auto', english: 'car', phonetic: 'au-to', cefrLevel: CEFRLevel.A1, frequency: 46, category: 'transport' },
      { finnish: 'bussi', english: 'bus', phonetic: 'bus-si', cefrLevel: CEFRLevel.A1, frequency: 47, category: 'transport' },
      { finnish: 'juna', english: 'train', phonetic: 'ju-na', cefrLevel: CEFRLevel.A1, frequency: 48, category: 'transport' },
      { finnish: 'lentokone', english: 'airplane', phonetic: 'len-to-ko-ne', cefrLevel: CEFRLevel.A1, frequency: 49, category: 'transport' },
      { finnish: 'leipä', english: 'bread', phonetic: 'lei-pa', cefrLevel: CEFRLevel.A1, frequency: 50, category: 'food' },
      { finnish: 'maito', english: 'milk', phonetic: 'mai-to', cefrLevel: CEFRLevel.A1, frequency: 51, category: 'food' },
      { finnish: 'liha', english: 'meat', phonetic: 'li-ha', cefrLevel: CEFRLevel.A1, frequency: 52, category: 'food' },
      { finnish: 'kala', english: 'fish', phonetic: 'ka-la', cefrLevel: CEFRLevel.A1, frequency: 53, category: 'food' },
      { finnish: 'kissa', english: 'cat', phonetic: 'kis-sa', cefrLevel: CEFRLevel.A1, frequency: 54, category: 'animals' },
      { finnish: 'koira', english: 'dog', phonetic: 'koi-ra', cefrLevel: CEFRLevel.A1, frequency: 55, category: 'animals' },
      { finnish: 'lintu', english: 'bird', phonetic: 'lin-tu', cefrLevel: CEFRLevel.A1, frequency: 56, category: 'animals' },
      { finnish: 'kukka', english: 'flower', phonetic: 'kuk-ka', cefrLevel: CEFRLevel.A1, frequency: 57, category: 'nature' },
      { finnish: 'puu', english: 'tree', phonetic: 'puu', cefrLevel: CEFRLevel.A1, frequency: 58, category: 'nature' },
      { finnish: 'kivi', english: 'stone', phonetic: 'ki-vi', cefrLevel: CEFRLevel.A1, frequency: 59, category: 'nature' },
      { finnish: 'järvi', english: 'lake', phonetic: 'jar-vi', cefrLevel: CEFRLevel.A1, frequency: 60, category: 'nature' },
      { finnish: 'metsä', english: 'forest', phonetic: 'met-sa', cefrLevel: CEFRLevel.A1, frequency: 61, category: 'nature' },
      { finnish: 'tuli', english: 'fire', phonetic: 'tu-li', cefrLevel: CEFRLevel.A1, frequency: 62, category: 'nature' },
      { finnish: 'ilma', english: 'air', phonetic: 'il-ma', cefrLevel: CEFRLevel.A1, frequency: 63, category: 'nature' },
      { finnish: 'marja', english: 'berry', phonetic: 'mar-ja', cefrLevel: CEFRLevel.A1, frequency: 64, category: 'food' },
      { finnish: 'talvi', english: 'winter', phonetic: 'tal-vi', cefrLevel: CEFRLevel.A1, frequency: 65, category: 'seasons' },
      { finnish: 'kevät', english: 'spring', phonetic: 'ke-vat', cefrLevel: CEFRLevel.A1, frequency: 66, category: 'seasons' },
      { finnish: 'kesä', english: 'summer', phonetic: 'ke-sa', cefrLevel: CEFRLevel.A1, frequency: 67, category: 'seasons' },
      { finnish: 'syksy', english: 'autumn', phonetic: 'syk-sy', cefrLevel: CEFRLevel.A1, frequency: 68, category: 'seasons' },
      { finnish: 'lumi', english: 'snow', phonetic: 'lu-mi', cefrLevel: CEFRLevel.A1, frequency: 69, category: 'weather' },
      { finnish: 'sade', english: 'rain', phonetic: 'sa-de', cefrLevel: CEFRLevel.A1, frequency: 70, category: 'weather' },
      { finnish: 'tuuli', english: 'wind', phonetic: 'tuu-li', cefrLevel: CEFRLevel.A1, frequency: 71, category: 'weather' },
      { finnish: 'aurinko', english: 'sun', phonetic: 'au-rin-ko', cefrLevel: CEFRLevel.A1, frequency: 72, category: 'weather' },
      { finnish: 'kuu', english: 'moon', phonetic: 'kuu', cefrLevel: CEFRLevel.A1, frequency: 73, category: 'nature' },
      { finnish: 'tähti', english: 'star', phonetic: 'tah-ti', cefrLevel: CEFRLevel.A1, frequency: 74, category: 'nature' },
      { finnish: 'kirja', english: 'book', phonetic: 'kir-ja', cefrLevel: CEFRLevel.A1, frequency: 75, category: 'education' },
      { finnish: 'kynä', english: 'pen', phonetic: 'ky-na', cefrLevel: CEFRLevel.A1, frequency: 76, category: 'education' },
      { finnish: 'paperi', english: 'paper', phonetic: 'pa-pe-ri', cefrLevel: CEFRLevel.A1, frequency: 77, category: 'education' },
      { finnish: 'pöytä', english: 'table', phonetic: 'poy-ta', cefrLevel: CEFRLevel.A1, frequency: 78, category: 'furniture' },
      { finnish: 'tuoli', english: 'chair', phonetic: 'tuo-li', cefrLevel: CEFRLevel.A1, frequency: 79, category: 'furniture' },
      { finnish: 'sänky', english: 'bed', phonetic: 'san-ky', cefrLevel: CEFRLevel.A1, frequency: 80, category: 'furniture' },
      { finnish: 'ikkuna', english: 'window', phonetic: 'ik-ku-na', cefrLevel: CEFRLevel.A1, frequency: 81, category: 'house' },
      { finnish: 'ovi', english: 'door', phonetic: 'o-vi', cefrLevel: CEFRLevel.A1, frequency: 82, category: 'house' },
      { finnish: 'seinä', english: 'wall', phonetic: 'sei-na', cefrLevel: CEFRLevel.A1, frequency: 83, category: 'house' },
      { finnish: 'katto', english: 'roof/ceiling', phonetic: 'kat-to', cefrLevel: CEFRLevel.A1, frequency: 84, category: 'house' },
      { finnish: 'lattia', english: 'floor', phonetic: 'lat-ti-a', cefrLevel: CEFRLevel.A1, frequency: 85, category: 'house' },
      { finnish: 'keittiö', english: 'kitchen', phonetic: 'keit-ti-o', cefrLevel: CEFRLevel.A1, frequency: 86, category: 'house' },
      { finnish: 'makuuhuone', english: 'bedroom', phonetic: 'ma-kuu-huo-ne', cefrLevel: CEFRLevel.A1, frequency: 87, category: 'house' },
      { finnish: 'olohuone', english: 'living room', phonetic: 'o-lo-huo-ne', cefrLevel: CEFRLevel.A1, frequency: 88, category: 'house' },
      { finnish: 'kylpyhuone', english: 'bathroom', phonetic: 'kyl-py-huo-ne', cefrLevel: CEFRLevel.A1, frequency: 89, category: 'house' },
      { finnish: 'vaate', english: 'clothing', phonetic: 'vaa-te', cefrLevel: CEFRLevel.A1, frequency: 90, category: 'clothing' },
      { finnish: 'kenkä', english: 'shoe', phonetic: 'ken-ka', cefrLevel: CEFRLevel.A1, frequency: 91, category: 'clothing' },
      { finnish: 'hattu', english: 'hat', phonetic: 'hat-tu', cefrLevel: CEFRLevel.A1, frequency: 92, category: 'clothing' },
      { finnish: 'takki', english: 'jacket', phonetic: 'tak-ki', cefrLevel: CEFRLevel.A1, frequency: 93, category: 'clothing' },
      { finnish: 'housut', english: 'pants', phonetic: 'hou-sut', cefrLevel: CEFRLevel.A1, frequency: 94, category: 'clothing' },
      { finnish: 'paita', english: 'shirt', phonetic: 'pai-ta', cefrLevel: CEFRLevel.A1, frequency: 95, category: 'clothing' },
      { finnish: 'mekko', english: 'dress', phonetic: 'mek-ko', cefrLevel: CEFRLevel.A1, frequency: 96, category: 'clothing' },
      { finnish: 'sukka', english: 'sock', phonetic: 'suk-ka', cefrLevel: CEFRLevel.A1, frequency: 97, category: 'clothing' },

      // Additional A2 Level words
      { finnish: 'syödä', english: 'to eat', phonetic: 'syo-da', cefrLevel: CEFRLevel.A2, frequency: 98, category: 'verbs' },
      { finnish: 'juoda', english: 'to drink', phonetic: 'juo-da', cefrLevel: CEFRLevel.A2, frequency: 99, category: 'verbs' },
      { finnish: 'nukkua', english: 'to sleep', phonetic: 'nuk-ku-a', cefrLevel: CEFRLevel.A2, frequency: 100, category: 'verbs' },
      { finnish: 'herätä', english: 'to wake up', phonetic: 'he-ra-ta', cefrLevel: CEFRLevel.A2, frequency: 101, category: 'verbs' },
      { finnish: 'katsoa', english: 'to watch/look', phonetic: 'kat-so-a', cefrLevel: CEFRLevel.A2, frequency: 102, category: 'verbs' },
      { finnish: 'kuunnella', english: 'to listen', phonetic: 'kuun-nel-la', cefrLevel: CEFRLevel.A2, frequency: 103, category: 'verbs' },
      { finnish: 'lukea', english: 'to read', phonetic: 'lu-ke-a', cefrLevel: CEFRLevel.A2, frequency: 104, category: 'verbs' },
      { finnish: 'kirjoittaa', english: 'to write', phonetic: 'kir-joit-taa', cefrLevel: CEFRLevel.A2, frequency: 105, category: 'verbs' },
      { finnish: 'ostaa', english: 'to buy', phonetic: 'os-taa', cefrLevel: CEFRLevel.A2, frequency: 106, category: 'verbs' },
      { finnish: 'myydä', english: 'to sell', phonetic: 'myy-da', cefrLevel: CEFRLevel.A2, frequency: 107, category: 'verbs' },
      { finnish: 'maksaa', english: 'to pay', phonetic: 'mak-saa', cefrLevel: CEFRLevel.A2, frequency: 108, category: 'verbs' },
      { finnish: 'raha', english: 'money', phonetic: 'ra-ha', cefrLevel: CEFRLevel.A2, frequency: 109, category: 'finance' },
      { finnish: 'kauppa', english: 'store/shop', phonetic: 'kaup-pa', cefrLevel: CEFRLevel.A2, frequency: 110, category: 'places' },
      { finnish: 'ravintola', english: 'restaurant', phonetic: 'ra-vin-to-la', cefrLevel: CEFRLevel.A2, frequency: 111, category: 'places' },
      { finnish: 'hotelli', english: 'hotel', phonetic: 'ho-tel-li', cefrLevel: CEFRLevel.A2, frequency: 112, category: 'places' },
      { finnish: 'sairaala', english: 'hospital', phonetic: 'sai-raa-la', cefrLevel: CEFRLevel.A2, frequency: 113, category: 'places' },
      { finnish: 'pankki', english: 'bank', phonetic: 'pank-ki', cefrLevel: CEFRLevel.A2, frequency: 114, category: 'places' },
      { finnish: 'kirkko', english: 'church', phonetic: 'kirk-ko', cefrLevel: CEFRLevel.A2, frequency: 115, category: 'places' },
      { finnish: 'museo', english: 'museum', phonetic: 'mu-se-o', cefrLevel: CEFRLevel.A2, frequency: 116, category: 'places' },
      { finnish: 'teatteri', english: 'theater', phonetic: 'te-at-te-ri', cefrLevel: CEFRLevel.A2, frequency: 117, category: 'places' },
      { finnish: 'elokuva', english: 'movie', phonetic: 'e-lo-ku-va', cefrLevel: CEFRLevel.A2, frequency: 118, category: 'entertainment' },
      { finnish: 'musiikki', english: 'music', phonetic: 'mu-siik-ki', cefrLevel: CEFRLevel.A2, frequency: 119, category: 'entertainment' },
      { finnish: 'urheilu', english: 'sports', phonetic: 'ur-hei-lu', cefrLevel: CEFRLevel.A2, frequency: 120, category: 'entertainment' }
    ];

    await this.wordsRepository.save(basicWords);
    console.log(`Seeded ${basicWords.length} words`);
  }
}
