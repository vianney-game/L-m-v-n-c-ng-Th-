export type VegetableId = 'mong_toi' | 'den_tim';

export type BunnyEmotion = 'NORMAL' | 'HAPPY' | 'WINK' | 'SAD';

export interface VegetableInfo {
  id: VegetableId;
  name: string;
  targetBasket: 'LEFT' | 'RIGHT';
  colorLabel: string;
  description: string;
  nutritionTip: string;
  imageDetail: string;
}

export interface PlacedState {
  mong_toi: boolean;
  den_tim: boolean;
}
