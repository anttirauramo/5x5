# "5x5" sananeliöpeli

## Säännöt

TODO :D

## Skriptit

### Parse Joukahainen

Hakee Joukahaisen sääntötiedostosta suunnilleen sopivat sanat. 

Argumentit: 
1. sanapituus 
2. output-fileen nimi

Esim. 
`python parse_joukahainen.py 5 wordlists/joukahainen_5.txt`

### Find solutions

Hakee ratkaisut annetun sanaston pohjalta.

Argumentit:
1. käytettävä sanasto
2. ratkaisutiedosto

Esim. 
`python find_solutions.py wordlists/joukahainen_3.txt solutions/solutions_3.txt`

## Ratkaisut

Nykyisellä Joukahaisesta otetulla sanastolla: 

* 3x3: 238 solutions found (0:00:00.476 minun windows-pelikoneella)
* 4x4: 22964 solutions (0:00:48 win, 0:00:34 "minun" macbookilla)
* 5x5: 6037 solutions (1:14:17 mac)
* 6x6: ...
