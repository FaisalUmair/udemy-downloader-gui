const Downloader = require('mt-files-downloader')

const dl = new Downloader().download("https://vtt-a.udemycdn.com/8180418/en_US/2017-09-27_07-30-19-1d1e4606d5268d806fd8aeef87ef83df.vtt?jkRWW8IiLnVPX-F7A99xcwKxqONw3X4tMVwFWKLwJZFm2IgQ7Ck4tUtUf9Hbd-ZmEOMzG61LPsZWZkKiMxhJj4bkgR4pP0HIgOLDrjqxiNn7Pv0xkpcltDj3syk8z_Hk5txra1iDYHT4-iD2PqnNlL6kmZwFSEr6wAvigxraXQ8mT_iJwg", '/Users/faisalumair/Dev/udemy-downloader-react/src/core/download/test.bin');


dl.start();


setInterval(() => {
    console.log(dl.getStats())
}, 2000);

