# ElektronEats - panel administratorski

---

## Wymagane narzędzia

- [Node.js](https://nodejs.org/en) (w projekcie wykorzystano wersję 16.18.1)
- [Yarn](https://yarnpkg.com/)
- [ElektronEats - API](https://github.com/literalnie1984/kantyna-app-api)

## Instrukcje uruchomienia

1. Sklonuj repozytorium na swój komputer.
2. W wierszu poleceń przejdź do folderu ze sklonowanym repozytorium.
3. Zainstaluj wymagane pakiety poleceniem `yarn`
4. W głównym katalogu projektu utwórz plik `.env.development`
5. Wewnątrz pliku `.env.development` umieść następującą treść:
```
VITE_API_URL="http://localhost:4765/api"
```
6. Przed uruchomieniem projektu upewnij się, że uruchomione zostało [API ElektronEats](https://github.com/literalnie1984/kantyna-app-api).
7. Uruchom projekt poleceniem `yarn dev`

---

### Literalnie 1984 (2023-2023)
