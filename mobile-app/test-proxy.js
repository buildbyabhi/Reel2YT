import * as AuthSession from 'expo-auth-session';

console.log(AuthSession.makeRedirectUri({ 
  useProxy: true, 
  projectNameForProxy: '@buildbyabhi/mobile-app' 
}));
