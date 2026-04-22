export type RootStackParamList = {
  '(auth)': undefined;
  '(client)': undefined;
  modal: undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
};

export type ClientTabParamList = {
  index: undefined;
  'tracking/[id]': { id: string };
  'tickets/index': undefined;
  'tickets/[id]': { id: string };
  'notifications/index': undefined;
  'profile/index': undefined;
};
