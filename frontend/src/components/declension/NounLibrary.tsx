'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';

interface Noun {
  id: number;
  nominative: string;
  translation: string;
  examples: string[];
  frequency: number;
  cefrLevel: string;
  declensionType: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface NounLibraryProps {
  onNounSelect?: (noun: string) => void;
}

export default function NounLibrary({ onNounSelect }: NounLibraryProps) {
  const [nouns, setNouns] = useState<Noun[]>([]);
  const [filteredNouns, setFilteredNouns] = useState<Noun[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNouns();
  }, []);

  useEffect(() => {
    filterNouns();
  }, [nouns, searchTerm]);

  const fetchNouns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/declension/nouns?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setNouns(data);
      }
    } catch (error) {
      console.error('Error fetching nouns:', error);
      // Fallback to hardcoded nouns if API fails
      setNouns([
        { id: 1, nominative: 'talo', translation: 'house', examples: [], frequency: 1, cefrLevel: 'A1', declensionType: 1 },
        { id: 2, nominative: 'katu', translation: 'street', examples: [], frequency: 2, cefrLevel: 'A1', declensionType: 1 },
        { id: 3, nominative: 'auto', translation: 'car', examples: [], frequency: 3, cefrLevel: 'A1', declensionType: 1 },
        { id: 4, nominative: 'käsi', translation: 'hand', examples: [], frequency: 6, cefrLevel: 'A1', declensionType: 5 },
        { id: 5, nominative: 'lintu', translation: 'bird', examples: [], frequency: 5, cefrLevel: 'A1', declensionType: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterNouns = () => {
    let filtered = nouns;

    if (searchTerm) {
      filtered = filtered.filter(noun =>
        noun.nominative.toLowerCase().includes(searchTerm.toLowerCase()) ||
        noun.translation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNouns(filtered);
  };

  const getDeclensionTypeLabel = (type: number): string => {
    const labels = {
      1: 'Type I',
      2: 'Type II', 
      3: 'Type III',
      4: 'Type IV',
      5: 'Type V',
      6: 'Type VI',
    };
    return labels[type as keyof typeof labels] || `Type ${type}`;
  };

  const getFrequencyColor = (frequency: number): string => {
    if (frequency <= 10) return 'bg-green-100 text-green-800';
    if (frequency <= 25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Noun Library</h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nouns or translations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Noun List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading nouns...
          </div>
        ) : filteredNouns.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No nouns found matching your criteria.
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredNouns.map((noun) => (
              <div
                key={noun.id}
                className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => onNounSelect?.(noun.nominative)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{noun.nominative}</span>
                      <span className="text-sm text-gray-600">- {noun.translation}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${getFrequencyColor(noun.frequency)}`}>
                        Freq: {noun.frequency}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {noun.cefrLevel}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        {getDeclensionTypeLabel(noun.declensionType)}
                      </span>
                    </div>

                    {noun.examples && noun.examples.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 italic">
                          "{noun.examples[0]}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
