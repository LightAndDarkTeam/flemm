## Flemm script

#### 1. Clone project
```bash
git clone blabla
```

#### 2. Installation dependance
```bash
yarn install
```

#### 3. Lancer serveur nodeJS en local sur ta machine
> Attention tu dois avoir Node d'installer sur ta machine (version 16)

```bash
yarn nodemon
```

Suite à ça tu devrais voir écrit qq chose comme ça dans ton terminal:
```bash
initialize detaSource
Server on port 5050
```

> C'est que le serveur tourne sur ta machine, tu peux donc mtn accéder à ton API

#### 4. Execution des scripts

Maintenant tu peux ouvrir n'importe quel navigateur internet et taper ces urls :


| definition                                      | url                                       |
|-------------------------------------------------|-------------------------------------------|
| récuperer les derniers metadatas depuis ma base | http://localhost:5050/api/update-metadata |
| créer le report                                 | http://localhost:5050/api/make-report     |
| récuperer le report en format xlsx              | http://localhost:5050/api/get-report      |

Par défault le rapport va se trouver dans le repertoire **files** du projet. 

Si tu en lances plusieurs / jour (ce qui ne sert pas à grand chose vu que je fais un releve de prix/j) le report va s'update vu que le nom est lié à la date, par contre le lendemain il va en recréer un nouveau ce qui permet de garder un historique.


