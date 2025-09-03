'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';

interface Verb {
  id: number;
  infinitive: string;
  type: number;
  stem: string;
  translation: string;
  examples: string[];
  frequency: number;
  cefrLevel: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface VerbLibraryProps {
  onVerbSelect?: (verb: string) => void;
}

export default function VerbLibrary({ onVerbSelect }: VerbLibraryProps) {
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [filteredVerbs, setFilteredVerbs] = useState<Verb[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchVerbs();
  }, []);

  useEffect(() => {
    filterVerbs();
  }, [verbs, searchTerm, selectedLevel, selectedType]);

  const fetchVerbs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/conjugation/verbs?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setVerbs(data);
      }
    } catch (error) {
      console.error('Error fetching verbs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVerbs = () => {
    let filtered = verbs;

    if (searchTerm) {
      filtered = filtered.filter(verb =>
        verb.infinitive.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verb.translation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel) {
      filtered = filtered.filter(verb => verb.cefrLevel === selectedLevel);
    }

    if (selectedType) {
      filtered = filtered.filter(verb => verb.type.toString() === selectedType);
    }

    setFilteredVerbs(filtered);
  };

  const getVerbTypeLabel = (type: number): string => {
    const labels = {
      1: 'Type I (-a/-ä)',
      2: 'Type II (-da/-dä)',
      3: 'Type III (-la/-lä, -na/-nä, -ra/-rä, -ta/-tä)',
      4: 'Type IV (-ata/-ätä)',
      5: 'Type V (-ita/-itä)',
      6: 'Type VI (-eta/-etä)',
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
          <h3 className="text-lg font-semibold text-gray-900">Verb Library</h3>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search verbs or translations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All CEFR Levels</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
              </select>
            </div>
            
            <div className="flex-1">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                <option value="1">Type I</option>
                <option value="2">Type II</option>
                <option value="3">Type III</option>
                <option value="4">Type IV</option>
                <option value="5">Type V</option>
                <option value="6">Type VI</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Verb List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading verbs...
          </div>
        ) : filteredVerbs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No verbs found matching your criteria.
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredVerbs.map((verb) => (
              <div
                key={verb.id}
                className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => onVerbSelect?.(verb.infinitive)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{verb.infinitive}</span>
                      <span className="text-sm text-gray-600">- {verb.translation}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${getFrequencyColor(verb.frequency)}`}>
                        Freq: {verb.frequency}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {verb.cefrLevel}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        Type {verb.type}
                      </span>
                    </div>

                    {verb.examples && verb.examples.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 italic">
                          "{verb.examples[0]}"
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
