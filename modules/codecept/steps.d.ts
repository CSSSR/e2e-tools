/// <reference types='codeceptjs' />

declare namespace CodeceptJS {
  interface SupportObject {
    I: I
    current: any
  }
  interface Methods extends TestCafe {}
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
