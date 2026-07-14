import { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type UserTabParamList = {
  Today: undefined;
  History: undefined;
  Settings: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

export type UserStackParamList = {
  Tabs: NavigatorScreenParams<UserTabParamList>;
  /** Student answers one questionnaire for a given day (defaults to today). */
  RespondQuestionnaire: { questionnaireId: string; date?: string };
};

export type AdminTabParamList = {
  Today: undefined;
  Students: undefined;
  Questions: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

export type AdminStackParamList = {
  Tabs: NavigatorScreenParams<AdminTabParamList>;
  StudentDetail: { studentId: string; studentName: string };
  Approvals: undefined;
  /**
   * Create or edit a questionnaire. Pass an existing `questionnaireId` to edit,
   * `duplicateFrom` to clone one, or `starter` to seed from a starter template.
   */
  QuestionnaireEditor:
    | {
        questionnaireId?: string;
        duplicateFrom?: string;
        starter?: string;
        asTemplate?: boolean;
      }
    | undefined;
  QuestionnaireResponses: { questionnaireId: string; title: string };
  /** Mentor configures the daily quick questions (metrics) devotees log. */
  MetricsEditor: undefined;
};
