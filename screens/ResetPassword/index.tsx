import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import BackButton from "../../components/BackButton";
import Form from "../../components/Form";
import TGLArea from "../../components/TGLArea";
import { RootAuthStackParamList } from "../../routes/Auth";
import { handleErrors } from "../../shared/helpers";
import { asyncResetPassword } from "../../shared/helpers/";

import { Container } from "./styles";

type Data = {
  token?: string;
};

const ResetPassword = (
  props: NativeStackScreenProps<RootAuthStackParamList, "ResetPassword">
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleResetPassword = async (fields: { email?: string }) => {
    try {
      setIsLoading(true);
      const token = await asyncResetPassword(fields.email!);
      setIsLoading(false);
      props.navigation.navigate("ChangePassword", { token });
    } catch (e) {
      setIsLoading(false);
      handleErrors("Error", "User not found in our database.", true);
    }
  };
  const handleGoBack = () => {
    props.navigation.goBack();
  };

  return (
    <Container>
      <TGLArea>Reset password</TGLArea>
      <Form
        loading={isLoading}
        isResetPassword
        onSubmit={handleResetPassword}
      />
      <BackButton onPress={handleGoBack}>Back</BackButton>
    </Container>
  );
};

export default ResetPassword;
