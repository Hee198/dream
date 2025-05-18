import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Intro from './intro.js';
import Home from './Home.js';
import Sub from './Sub.js';
import Mark from './Mark.js';
import Social from './social.js';
import Library from './library.js';
import Academy from './academy.js';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Intro">
        <Stack.Screen 
          name="Intro" 
          component={Intro}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Sub" 
          component={Sub}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Mark" 
          component={Mark}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Social" 
          component={Social}
          options={{ headerShown: false }} 
        />
         <Stack.Screen 
          name="Library" 
          component={Library}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Academy" 
          component={Academy}
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App; 