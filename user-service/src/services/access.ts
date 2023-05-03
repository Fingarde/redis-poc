import { AccessControl } from 'accesscontrol';

const ac = new AccessControl()

ac.grant('user')
    .readOwn('account')
    .updateOwn('account')

ac.grant('admin')
    .createAny('account')
    .updateAny('account')
    .readAny('account')
    .deleteAny('account')


export default ac;
