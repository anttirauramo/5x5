# "5x5" sananeliöpeli

## Säännöt

Täytä NxN-kokoinen ruudukko kirjaimilla siten, että jokainen rivi ja sarake muodostaa sanan sanalistasta.

Sanat ovat lähtökohtaisesti perusmuotoisia sanoja, erillisnimiä, interjektioita jne. ei hyväksytä. 

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

### Find palindromes

Etsii sanalistasta sanat, jotka käännettynä muodostavat toisen sanan sanalistasta.

Argumentit:
1. sanalistotiedosto

Esim.
`python find_palindromes.py wordlists/joukahainen_5.txt`

### Fully unique

Laskee ratkaisutiedostosta ratkaisut, joissa jokainen sana (rivi ja sarake) esiintyy vain kerran.

Argumentit:
1. ratkaisutiedosto

Optiot:
- `--print-first` tulostaa ensimmäisen täysin uniikin ratkaisun

Esim.
`python fully_unique.py solutions/joukahainen_5.txt --print-first`

## Ratkaisut

### Joukahaisesta otetulla sanastolla

Joukahainen on oikolukuohjelma Voikon sansto. 
https://joukahainen.puimula.org/

Sanalistaa varten suodatin Joukahaisesta pois seuraavat tyylit: ["it", "dialect", "confusing", "foreign", "old", "international", "incorrect", "nature"]
...ja otin mukaan vain seuraavat sanaluokat: ["adjective", "adverb", "conjunction","noun","verb"]

* 3x3: 238 solutions found (0:00:00.476 minun windows-pelikoneella)
* 4x4: 22964 solutions (0:00:48 win, 0:00:34 "minun" macbookilla)
* 5x5: 6037 solutions (1:14:17 mac)
* 6x6: 123 solutions (14:07:22 mac)

5x5-ratkaisuista 150 on sellaisia, joissa kukin sana esiintyy vain kerran. 

Joukahainen on julkaistu GPL-lisenssillä ja se ei siksi ole mobiilisovelluksessa valittavissa. 

### Kotuksen nykysuomen sanalistalla

Kotimaisten kielten keskuksen Nykysuomen sanalista on Kielitoimiston sanakirjan hakusanoihin perustuva, päivitettävä sanalista. Siinä on yli satatuhatta taivutus- ja sanaluokkatiedoin varustettua sanaa.

* 3x3: 10355 ratkaisua
* 4x4: 22964 ratkaisua

Sanalista julkaistaan lisenssillä CC BY 4.0.
