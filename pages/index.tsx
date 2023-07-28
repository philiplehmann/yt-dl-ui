import React, { useState, useCallback, memo, useEffect, ChangeEventHandler } from 'react';
import Head from 'next/head';
import { Box } from '@mui/material';
import { io } from 'socket.io-client';

import { FormControl, TextField } from '@mui/material';
import type { YoutubeDLQueue } from 'helpers/youtube_dl';

const Home = memo(() => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<YoutubeDLQueue[]>([]);

  const setUrlHandler = useCallback(
    (event) => {
      setUrl(event.target.value);
    },
    [setUrl]
  ) as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  const submitHandler = useCallback(
    (event) => {
      setUrl((newUrl) => {
        fetch('/api/add', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          cache: 'no-cache',
          body: JSON.stringify({ url: newUrl })
        });
        return '';
      });
      event.preventDefault();
    },
    [setUrl]
  );

  useEffect(() => {
    fetch('/api/status', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      cache: 'no-cache'
    }).then(() => {
      const socket = io();

      socket.on('connect', () => {
        // eslint-disable-next-line no-console
        console.log('connected');
        socket.on('status', (data) => {
          setStatus(data);
        });
      });
    });
  }, [setStatus]);

  return (
    <div>
      <Head>
        <title>youtube-dl</title>
        <meta name="description" content="youtube-dl to save files to specific folder" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <FormControl>
          <Box component="form" noValidate autoComplete="off" onSubmit={submitHandler}>
            <TextField label="youtube-dl url" value={url} onChange={setUrlHandler} />
            <ul>
              {status.map((entry, index) => {
                return (
                  <li key={index}>
                    {entry.url}: <span style={{ whiteSpace: 'pre' }}>{entry.data}</span>
                  </li>
                );
              })}
            </ul>
          </Box>
        </FormControl>
      </main>
    </div>
  );
});
Home.displayName = 'Home';

export default Home;
