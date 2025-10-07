import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import routeItems from './routes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useThemeStore from '@/store/theme.store';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabs } from '@/components';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabRoutes() {
  return (
    <Tab.Navigator
      tabBar={CustomTabs}
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      {routeItems
        .filter(r => r.meta.isTab)
        .map(r => (
          <Tab.Screen
            key={r.name}
            name={r.name}
            component={r.component}
            options={{
              headerShown: false,
            }}
          />
        ))}
    </Tab.Navigator>
  );
}

export default function Router() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerTitleAlign: 'center',
          contentStyle: {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left ,
            paddingRight: insets.right,
          },
        }}
      >
        <Stack.Screen name="MainTabs" component={TabRoutes} />

        {routeItems
          .filter(r => !r.meta.isTab)
          .map(r => (
            <Stack.Screen
              key={r.name}
              name={r.name}
              component={r.component}
              options={{
                headerShown: r.meta.showHeader,
                statusBarAnimation: 'fade',
                presentation: r.meta.isModal ? 'transparentModal' : undefined,
              }}
            />
          ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
