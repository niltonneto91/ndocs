export const DEMO_COMPANY_ID = "company_demo_ntn";
export const DEMO_USER_ID = "user_demo_admin";

export async function getCurrentDemoContext() {
  return {
    currentCompanyId: DEMO_COMPANY_ID,
    currentUserId: DEMO_USER_ID
  };
}
