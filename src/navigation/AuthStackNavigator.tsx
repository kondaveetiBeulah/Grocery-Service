import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';

import { G1RegistrationIntroScreen } from '../screens/onboarding/G1RegistrationIntroScreen';
import { G2StoreDetailsScreen } from '../screens/onboarding/G2StoreDetailsScreen';
import { G3DocumentsUploadScreen } from '../screens/onboarding/G3DocumentsUploadScreen';
import { G4DocumentReviewScreen } from '../screens/onboarding/G4DocumentReviewScreen';
import { G5LocationDeliveryScreen } from '../screens/onboarding/G5LocationDeliveryScreen';
import { G6CatalogSetupScreen } from '../screens/onboarding/G6CatalogSetupScreen';
import { G7CatalogReviewScreen } from '../screens/onboarding/G7CatalogReviewScreen';
import { G8PricingPlanBankScreen } from '../screens/onboarding/G8PricingPlanBankScreen';
import { G8PaymentScreen } from '../screens/onboarding/G8PaymentScreen';
import { G9VerificationStatusScreen } from '../screens/onboarding/G9VerificationStatusScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="G1RegistrationIntro"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="G1RegistrationIntro" component={G1RegistrationIntroScreen} />
      <Stack.Screen name="G2StoreDetails" component={G2StoreDetailsScreen} />
      <Stack.Screen name="G3DocumentsUpload" component={G3DocumentsUploadScreen} />
      <Stack.Screen name="G4DocumentReview" component={G4DocumentReviewScreen} />
      <Stack.Screen name="G5LocationDelivery" component={G5LocationDeliveryScreen} />
      <Stack.Screen name="G6CatalogSetup" component={G6CatalogSetupScreen} />
      <Stack.Screen name="G7CatalogReview" component={G7CatalogReviewScreen} />
      <Stack.Screen name="G8PricingPlanBank" component={G8PricingPlanBankScreen} />
      <Stack.Screen name="G8Payment" component={G8PaymentScreen} />
      <Stack.Screen name="G9VerificationStatus" component={G9VerificationStatusScreen} />
    </Stack.Navigator>
  );
};
