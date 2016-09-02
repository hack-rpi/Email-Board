declare module "mailgun-js" {
  
  function mailer(options: Options): Mailer;
  export = mailer;

  interface Options {
    api_key: string,
    domain: string
  }

  interface Data {
    from: string,
    to: string,
    cc?: string,
    bcc?: string,
    subject: string,
    text: string,
    html?: string,
    attachment?: string
  }

  interface Mailer {
    messages: () => Send
  }

  interface Send {
    send: (data: Data, callback: Callback) => void
  }

  interface Callback {
    (error: any, body: any): any
  }

}
