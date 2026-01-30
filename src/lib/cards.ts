export type CardType = "number" | "action" | "bonus";

export interface CardDefinition {
  id: string;
  name: string;
  value: number;
  type: CardType;
  image: string;
  description?: string;
  count: number;
}

export const CARDS: CardDefinition[] = [
  // Number cards
  { id: "0", name: "Zero", value: 0, type: "number", image: "/cards/0.png", count: 1 },
  { id: "1", name: "One", value: 1, type: "number", image: "/cards/1.png", count: 1 },
  { id: "2", name: "Two", value: 2, type: "number", image: "/cards/2.png", count: 2 },
  { id: "3", name: "Three", value: 3, type: "number", image: "/cards/3.png", count: 3 },
  { id: "4", name: "Four", value: 4, type: "number", image: "/cards/4.png", count: 4 },
  { id: "5", name: "Five", value: 5, type: "number", image: "/cards/5.png", count: 5 },
  { id: "6", name: "Six", value: 6, type: "number", image: "/cards/6.png", count: 6 },
  { id: "7", name: "Seven", value: 7, type: "number", image: "/cards/7.png", count: 7 },
  { id: "8", name: "Eight", value: 8, type: "number", image: "/cards/8.png", count: 8 },
  { id: "9", name: "Nine", value: 9, type: "number", image: "/cards/9.png", count: 9 },
  { id: "10", name: "Ten", value: 10, type: "number", image: "/cards/10.png", count: 10 },
  { id: "11", name: "Eleven", value: 11, type: "number", image: "/cards/11.png", count: 11 },
  { id: "12", name: "Twelve", value: 12, type: "number", image: "/cards/12.png", count: 12 },

  // Action cards
  { id: "freeze", name: "Freeze", value: 0, type: "action", image: "/cards/freeze.png", description: "Gèle un joueur actif", count: 3 },
  { id: "flip_three", name: "Flip Three", value: 0, type: "action", image: "/cards/flip_three.png", description: "Retourne 3 cartes d'un joueur actif", count: 3 },
  { id: "second_chance", name: "Second Chance", value: 0, type: "action", image: "/cards/second_chance.png", description: "Garde cette carte pour une seconde chance", count: 3 },

  // Bonus cards
  { id: "x2", name: "x2", value: 0, type: "bonus", image: "/cards/x2.png", description: "x2 la somme de vos cartes numéro", count: 1 },
  { id: "plus_2", name: "+2", value: 2, type: "bonus", image: "/cards/plus_2.png", description: "+2 à la somme de vos cartes numéro", count: 1 },
  { id: "plus_4", name: "+4", value: 4, type: "bonus", image: "/cards/plus_4.png", description: "+4 à la somme de vos cartes numéro", count: 1 },
  { id: "plus_6", name: "+6", value: 6, type: "bonus", image: "/cards/plus_6.png", description: "+6 à la somme de vos cartes numéro", count: 1 },
  { id: "plus_8", name: "+8", value: 8, type: "bonus", image: "/cards/plus_8.png", description: "+8 à la somme de vos cartes numéro", count: 1 },
  { id: "plus_10", name: "+10", value: 10, type: "bonus", image: "/cards/plus_10.png", description: "+10 à la somme de vos cartes numéro", count: 1 },
];

export const CARD_BACK_IMAGE = "/cards/back.png";

export function getCard(id: string): CardDefinition | undefined {
  return CARDS.find((c) => c.id === id);
}
