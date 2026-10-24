import React from 'react';
import { ChampionInfo } from '../types/ibadat';

export interface YesterdayChampionCardProps {
  champion?: ChampionInfo | null;
  onClick?: () => void;
  bnDateStr?: string;
}

export const YesterdayChampionCard: React.FC<YesterdayChampionCardProps> = () => {
  return null;
};
