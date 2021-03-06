import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { generateArray, generateRandomNumber } from "@shared/helpers";
import { getGames } from "@shared/services/api/games";
import { AppDispatch, AppThunk } from "@store/types";
import { GameRules, GameSliceState } from "./types";

export const asyncGetGames = (): AppThunk => {
  return async (dispatch: AppDispatch) => {
    try {
      const data = await getGames();
      dispatch(setGameRules(data));
    } catch (e: any) {
      throw new Error(e.message);
    }
  };
};

const initialState: GameSliceState = {
  minValue: null,
  avaiableGames: [],
  selectedGame: null,
  ballsNotSelected: [],
  ballsSelected: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameRules(state, action: PayloadAction<GameRules>) {
      state.minValue = action.payload.min_cart_value;
      state.avaiableGames = action.payload.types;
      state.selectedGame = { ...action.payload.types[0], id: (1).toString() };
      state.ballsNotSelected = generateArray(action.payload.types[0].range);
      state.ballsSelected = [];
    },
    selectGame(state, action: PayloadAction<{ item: string }>) {
      const selectedGame = state.avaiableGames.find(
        (game) => game.type === action.payload.item
      );
      const index = state.avaiableGames.findIndex(
        (game) => game.type === action.payload.item
      );

      if (selectedGame) {
        state.selectedGame = { ...selectedGame, id: (index + 1).toString() };
        state.ballsSelected = [];
        state.ballsNotSelected = generateArray(selectedGame.range);
      }
    },
    selectBall(state, action: PayloadAction<{ ball: number }>) {
      const ballAlreadySelected = state.ballsSelected.find(
        (ball) => ball === action.payload.ball
      );
      if (ballAlreadySelected) {
        state.ballsSelected = state.ballsSelected.filter(
          (ball) => ball !== ballAlreadySelected
        );
        state.ballsNotSelected.push(ballAlreadySelected);
      } else {
        if (state.ballsSelected.length === state.selectedGame?.max_number) {
          throw new Error(
            `Max of ${state.selectedGame.max_number} numbers hit!`
          );
        }
        state.ballsSelected.push(action.payload.ball);
        state.ballsNotSelected.filter((ball) => ball !== action.payload.ball);
      }
    },
    completeGame(state) {
      const numberBallsSelected = state.ballsSelected.length;
      const numberBallsToBeSelected =
        state.selectedGame!.max_number - numberBallsSelected;
      if (numberBallsToBeSelected === 0) {
        throw new Error(
          "Your game could not be completed as it is already complete!"
        );
      }
      for (let i = 0; i < numberBallsToBeSelected; i++) {
        const randomBall = generateRandomNumber(
          0,
          state.ballsNotSelected.length - 1
        );
        const ballToBeAdded = state.ballsNotSelected[randomBall];
        state.ballsSelected.push(ballToBeAdded);
        state.ballsNotSelected = state.ballsNotSelected.filter(
          (ball) => ballToBeAdded !== ball
        );
      }
    },
    clearGame(state) {
      state.ballsSelected = [];
      state.ballsNotSelected = generateArray(state.selectedGame!.range);
    },
    resetGame(state) {
      state.selectedGame = { ...state.avaiableGames[0], id: (1).toString() };
    },
  },
});

export const {
  setGameRules,
  selectGame,
  selectBall,
  completeGame,
  clearGame,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
