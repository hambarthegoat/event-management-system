import { createHttpServer } from './presentation/HttpServer';
import { container } from './presentation/Container';

const port = Number(process.env.PORT) || 3000;

const app = createHttpServer(container);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
