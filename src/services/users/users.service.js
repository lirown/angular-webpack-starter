@Injectable()
export default class UserService {
    constructor () {
        this.name = 'user';
        console.log(__filename);
        console.log(__dirname);
    }
}


