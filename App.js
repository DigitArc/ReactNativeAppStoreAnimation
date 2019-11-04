import React from 'react';
import * as Font from 'expo-font';
import { AppLoading } from 'expo';

import AppStoreScreen from './screens/AppStoreScreen';

export default function App() {
  const [loadingState, setLoadingState] = React.useState(true);

  React.useEffect(() => {
    Font.loadAsync({
      'Montserrat': require('./assets/fonts/Montserrat-Medium.ttf'),
      'Montserrat-Light': require('./assets/fonts/Montserrat-Light.ttf'),
      'Montserrat-Thin': require('./assets/fonts/Montserrat-Thin.ttf'),
    }).then(() => setLoadingState(curr => false))
  }, [])

  return loadingState ? <AppLoading /> : <AppStoreScreen />
}

