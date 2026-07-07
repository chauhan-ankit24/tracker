import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type UserTabParamList = {
  Today: undefined;
  History: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Today: undefined;
  Students: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

export type AdminStackParamList = {
  Tabs: NavigatorScreenParams<AdminTabParamList>;
  StudentDetail: { studentId: string; studentName: string };
  Approvals: undefined;
};
