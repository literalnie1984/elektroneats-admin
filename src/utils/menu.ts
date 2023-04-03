import { iif, Observable, switchMap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { retrieveJwtToken } from "./jwt";
import * as API from "@/utils/api";

export interface FetchedDinnerItem {
  id: number;
  name: string;
  price: string;
  image: string;
}

export enum FetchedMealType {
  Main = "Main",
  Soup = "Soup",
}

export interface FetchedMeal extends FetchedDinnerItem {
  weekDay: number;
  maxSupply: number;
  type: FetchedMealType;
}

export enum FetchedExtraType {
  Filler = "Filler",
  Salad = "Salad",
  Beverage = "Beverage",
}

export interface FetchedExtra extends FetchedDinnerItem {
  type: FetchedExtraType;
}

export interface FetchedDinner {
  dinners: FetchedMeal[];
  extras: FetchedExtra[];
}

interface FetchedSingleMenu {
  dinners: FetchedMeal[];
  extrasIds: number[];
}

export interface FetchedWeeklyMenu {
  response: FetchedSingleMenu[];
  extras: FetchedExtra[];
}

export interface DinnerItem {
  id: number;
  name: string;
  price: string;
  uri: string;
}

export interface DailyMenu {
  weekDay: number;
  main: DinnerItem[];
  soup: DinnerItem;
  extras: {
    fillers: DinnerItem[];
    salads: DinnerItem[];
    beverages: DinnerItem[];
  };
}

export type WeeklyMenu = DailyMenu[];

export interface FetchedLastUpdate {
  lastUpdate: number;
}

const reduceProps = (obj: FetchedDinnerItem): DinnerItem => {
  return {
    id: obj.id,
    name: obj.name,
    price: obj.price,
    uri: obj.image,
  };
};

export const parseFetchedWeeklyMenu = ({ response, extras }: FetchedWeeklyMenu): WeeklyMenu => {
  const dailyMenus: DailyMenu[] = [];

  response.forEach(singleMenu => {
    if(singleMenu.dinners.length === 0) return;
    const weekDay: number = singleMenu.dinners[0].weekDay;

    const mappedExtras = singleMenu.extrasIds.map(id => extras.find(i => i.id === id));
    const safeExtras = mappedExtras.filter(i => i !== undefined) as FetchedExtra[];

    const fillers: DinnerItem[] = safeExtras.filter(i => i.type === FetchedExtraType.Filler).map(reduceProps);
    const salads: DinnerItem[] = safeExtras.filter(i => i.type === FetchedExtraType.Salad).map(reduceProps);
    const beverages: DinnerItem[] = safeExtras.filter(i => i.type === FetchedExtraType.Beverage).map(reduceProps);

    dailyMenus.push({
      main: singleMenu.dinners.filter((i) => i.type === FetchedMealType.Main).map(reduceProps),
      soup: singleMenu.dinners.filter((i) => i.type === FetchedMealType.Soup).map(reduceProps)[0],
      extras: {
        fillers,
        salads,
        beverages
      },
      weekDay
    });
  });

  return dailyMenus;
};

export function getWeeklyMenu(): Observable<WeeklyMenu | null> {
  return retrieveJwtToken()
    .asObservable()
    .pipe(
      switchMap(jwt => {
        if(jwt !== null) {
          return API.getWeeklyMenu(jwt);
        } else {
          throw new Error("Empty JWT");
        }
      })
    );
}

export function mapWeekDayNumberToName(weekDayNumber: number): string {
  switch(weekDayNumber) {
  case 0:
    return "Poniedziałek";
    break;
  case 1:
    return "Wtorek";
    break;
  case 2:
    return "Środa";
    break;
  case 3:
    return "Czwartek";
    break;
  case 4:
    return "Piątek";
    break;
  default:
    return "Nieznany";
  }
}
