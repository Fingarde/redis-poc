export type Response = {
    data?: any;
    error?: any;
};
  
export type Request = {
    action: string;
    data?: any;
};

export type ResponseMessage = {
    correlationId: string;
    data?: any;
    error?: any;
};

export type RequestMessage = {
    correlationId : string;
    replyTo: string;

    action: string;
    data?: any;
};