import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { RootBetStackNavigator } from "@routes/App/types";
import { RootState } from "@store/types";
import { convertToReal, handleErrors } from "@shared/helpers";
import {
  CartContainer,
  CartArea,
  CartTotalArea,
  CartText,
  TotalText,
  MainButtonArea,
  Content,
  CartItemsArea,
  Wrapper,
} from "./styles";
import { MainButton, EmptyCart, CartItem } from "@components/index";
import { clearCart, asyncMakeBet } from "@store/slices/cartSlice";
import { FlatList } from "react-native";

const Cart = (props: NativeStackScreenProps<RootBetStackNavigator, "Cart">) => {
  const dispatch = useDispatch();
  const minValue = useSelector((state: RootState) => state.game.minValue!);

  const items = useSelector((state: RootState) => state.cart.items);
  const totalAmount = useSelector((state: RootState) => state.cart.totalAmount);

  useEffect(() => {
    props.navigation.setOptions({
      headerShown: true,
      title: "Your cart",
    });
  }, []);

  const itemsApi = items.map((item) => {
    return { id: item.gameId, numbers: [...item.numbers] };
  });

  const handleSaveGame = async () => {
    try {
      if (totalAmount >= minValue) {
        await dispatch(asyncMakeBet(itemsApi));
        dispatch(clearCart());
        props.navigation.goBack();
      } else {
        handleErrors(
          "Game error",
          `The minimum stake is R$ ${convertToReal(minValue)}`,
          true
        );
      }
    } catch (e: any) {
      handleErrors("Cart error", e.message, true);
    }
  };

  const realAmount = convertToReal(totalAmount);

  const cartItemsElements = items.map((item) => (
    <CartItem key={item.id} item={item} />
  ));

  let flexProperty =
    cartItemsElements.length === 1
      ? 0.5
      : cartItemsElements.length <= 2
      ? cartItemsElements.length * 0.08 + 0.5
      : cartItemsElements.length * 0.11 + 0.5;

  flexProperty = flexProperty > 1 ? 1 : flexProperty;

  return (
    <Wrapper onReduce={flexProperty}>
      <CartContainer style={{ elevation: 1 }}>
        <CartArea>
          <Content>
            <CartText>CART</CartText>
            {cartItemsElements.length === 0 ? (
              <EmptyCart />
            ) : (
              <CartItemsArea>
                <FlatList
                  style={{ width: "100%" }}
                  data={items}
                  renderItem={(item) => <CartItem item={item.item} />}
                />
              </CartItemsArea>
            )}
            <CartTotalArea>
              <CartText>CART </CartText>
              <TotalText>TOTAL: R$ {realAmount}</TotalText>
            </CartTotalArea>
          </Content>
          {totalAmount !== 0 ? (
            <MainButtonArea>
              <MainButton isSaveCart onPress={handleSaveGame}>
                Save
              </MainButton>
            </MainButtonArea>
          ) : null}
        </CartArea>
      </CartContainer>
    </Wrapper>
  );
};

export default Cart;
