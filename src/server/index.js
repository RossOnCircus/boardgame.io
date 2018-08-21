/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const Koa = require('koa');

import { DBFromEnv } from './db';
import { createApiServer } from './api';
import { SocketIO } from './transport/socketio';

export function Server({ games, db, transport, _clientInfo, _roomInfo }) {
  const app = new Koa();

  if (db === undefined) {
    db = DBFromEnv();
  }
  app.context.db = db;

  if (transport === undefined) {
    transport = SocketIO(_clientInfo, _roomInfo);
  }
  transport.init(app, games);

  const api = createApiServer({ db, games });

  return {
    app,
    api,
    db,
    run: async (port, callback) => {
      await db.connect();
      await api.listen(port + 1);
      await app.listen(port, callback);
    },
  };
}
