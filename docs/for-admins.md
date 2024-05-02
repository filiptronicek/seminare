# Pro správce

## Vytváření a úprava Akcí

Pro vytváření a upravování Akcí je důležité být do aplikace přihlášený.
Je také důležité obdržet roli správce, což je možné po kontaktování
[it@gtmskola.cz](mailto:it@gtmskola.cz)[^1]. Po změně
a navýšení role uživatele se v horním menu objeví položka "Správa Akcí".

![Navigační lišta se zvýrazněným odkazem "Správa Akcí"](assets/manage-events.png)

Na této stránce je tabulka se všemi Akcemi, které se v databázi
vyskytují. Obsahuje nejen nadcházející, ale i všechny historické Akce
pro archivní účely. V seznamu se dá hledat pomocí textového pole
"Vyhledat", které dokáže hledat ve sloupcích "Název", "Typ", dat začátku
a konce přihlašování a v seznamu zúčastněných tříd[^2].

Úprava Akce je možná na její podstránce, která je dostupná pod tlačítkem
"Zobrazit". Data, která se dají na stránce upravit, jsou:

-   **Název**: krátký popis Akce, který se zobrazí pro žáky jak na
    hlavní stránce, tak na podstránce jejího detailu. Je doporučeno mít
    názvy deskriptivní a věcné, aby bylo na první pohled jasné, o jaké
    přihlašování se jedná. Příklad doporučeného formátu názvu volby
    seminářů je "Semináře (8G) 2024/2025", jelikož je nejen jasné,
    o jakou třídu se jedná, ale i to, v jakém školním roce budou
    semináře z přihlašování relevantní. Inkluze školního roku je potom
    užitečná hlavně pro účely hledání v přihláškách z minulých let.

-   **Popis**: detailnější anotace Akce, která je ve svém celku
    viditelná na její podstránce. Toto pole je užitečné pro obecné
    informace k přihlašování, jako kde a s kým se Akce koná, kontakt na
    zodpovědnou osobu či často kladené dotazy.

-   **Více možností na uživatele**: toto políčko zaškrtněte, pokud
    chcete, aby si jeden žák mohl vybrat více možností této Akce
    najednou. Například pro výběr projektového dne je užitečné nechat
    políčko nezaškrtnuté, jelikož se jeden žák může zúčastnit jen
    jednoho projektu. Narozdíl od toho je volba seminářů ideální pro
    umožnění volby několika možností jedním žákem.

-   **Typ Akce**: toto pole pomáhá systému v adaptaci na dané
    přihlašování. Například typ "Semináře" rozšiřuje možnosti nastavení
    o zadání počtu týdenní hodinové dotace, učitele a větve[^3].

-   **Přihlášky**: určení doby, ve které bude možné pro žáky se na Akci
    přihlásit. Přihlašování musí být v rozmezí alespoň jednoho dne a
    platí vždy od půlnoci dne začátku přihlášek do 23:59 dne konce
    přihlášek[^4]. Mimo rozmezí těchto dat nedovolí uživatelům systém se
    přihlásit na kteroukoliv jimi vybranou možnost a zobrazí jim
    možnosti, které si vybrali. Pro vybrání časového okna trvající jen
    jeden den je možné na datum v kalendáři poklepat dvakrát.

-   **Konání**: rozmezí dat, mezi kterými se Akce koná. Tento údaj se
    ukazuje na stránce detailu Akce a také umožňuje systému ukazovat
    Akce na domovské stránce uživatele i přes to, že přihlašování již
    skončilo pro účely zkontrolování jejich volby, jakou jsou jejich
    semináře na příští rok.

-   **Hodin týdně**: vztahuje se jen na semináře. Určuje počet hodin,
    kterého musí dohromady žáci dosáhnout kombinací všech jejich
    seminářů.

-   **Omezení tříd**: Akce mohou omezit to, jaké třídy je vidí a mohou
    zobrazit. I zde se identifikují třídy podle jejich dvouznakového
    názvu (1G, 6G, 2N). Pokud pole zůstane prázdné, Akce bude dostupná k
    zobrazení a přihlašování od všech uživatelů bez omezení.

Nové Akce se dají vytvářet za pomocí tlačítka "Vytvořit Akci" na stránce
"Správa Akcí". Typ dat, které do formuláře uživatel vyplní se shodují s
těmi zobrazenými na podstránce Akce, které jsou popsané výše. Odstranění
Akce je možné na spodní části detailu Akce tlačítkem "Smazat Akci" a
následným potvrzením ve vyskakovacím okně.[^5]

## Vytváření a úprava možností Akce

Každé Akci náleží libovolný počet možností, na které se žáci mohou
přihlásit. Možnosti se vytvářejí až po vytvoření odpovídající Akce na
její podstránce. Podobně jako samostatné Akce se možnosti u vytváření a
upravování shodují: vytváření je dostupné pomocí tlačítka "Přidat
možnost" nad tabulkou s možnostmi a upravování možnosti je možné
tlačítkem "Upravit" v posledním sloupci tabulky. Data, která se dají
upravit u jedné možnosti, jsou:

-   **Název**: krátký titulek možnosti, který se bude zobrazovat na
    výčtu možností u jedné Akce.

-   **Popis**: krátký popis možnosti, který se bude zobrazovat na výčtu
    možností u jedné Akce. Dá se použít například pro krátkou anotaci a
    bližší informace jako například učitele zodpovědného za daný projekt
    projektového týdne.

-   **Maximální počet účastníků**: maximální kapacita možnosti, která
    určuje počet přihlášených, po jehož dosažení zakáže systém se
    přihlašovat všem dalším. Toto pole je užitečné například pro
    projekty na projektových týdnech nebo výlety.

-   **Hodin týdně**: vztahuje se jen na semináře. Určuje počet hodin,
    který zabírá daný předmět v rozvrhu žáka. Pro semináře, které se
    týden od týdne liší (např. jeden dvouhodinový blok za 14 dnů) se
    uvádí údaj průměru přes toto období (v našem příkladě tedy 1 hodina
    týdně).[^6]

-   **Větev**: vztahuje se jen na semináře. Rozhoduje o zaměření
    semináře, přičemž ve výchozím nastavení je na výběr z větve
    přírodovědné, humanitní a univerzální. Pravidla zaměření jsou:

    -   Na předměty v univerzální větvi se může uživatel zapsat
        kdykoliv.

    -   Na předměty ve větvi přírodovědné a humanitní se může uživatel
        zapsat jen v případě, že se již nezapsal na kterýkoliv předmět z
        větve druhé. Tyto větve se vzájemně vylučují a není možné jejich
        předměty kombinovat.

    -   Každý předmět může mít právě jedno zaměření.

Implementační poznámka k větvím seminárních předmětů: v aktuální verzi
aplikace se dají na předměty seminářů aplikovat jen tři předem zmíněné
větve -- univerzální, humanitní a přírodovědná. Funkcionalita vzájemného
vylučování (mutual exclusivity) je indikována typem větve: pokud je její
typ "oneof", může si uživatel vybrat jen jednu větev ze všech větví,
které mají také typ "oneof". Ostatní větve mají typ "unbound" a jejich
možnosti jsou volitelné vždy, nezávisle na ostatních větvích. Takto
vypadá výchozí nastavení větví:

```ts
const AVAILABLE_BRANCHES = [
    { id: "universal", label: "Univerzální", type: "unbound" },
    { id: "humanitarian", label: "Humanitní", type: "oneof" },
    { id: "science", label: "Přírodovědná", type: "oneof" },
];
```

## Exportování dat Akce do souboru .xlsx

Aplikace umožňuje správcům z jednotlivých Akcí vygenerovat tabulkový
soubor kompatibilní s aplikacemi jako je Microsoft Excel, Tabulky
Google, iWork Numbers či LibreOffice Calc.

Vyexportovaný soubor obsahuje právě tolik listů, jako je dostupných
možností u zvolené Akce. Každý list je pojmenován podle názvu možnosti a
obsahuje dva sloupce: "Jméno" a "Třída". Řádky tabulky korespondují ke
všem uživatelům, kteří se na danou akci přihlásili.

Vygenerování tabulky a jeho následné stažení je možné na podstránce Akce
ve správcovském rozhraní, stisknutím tlačítka "Stáhnout jako .xlsx".

Poznámka: informace o třídě jsou do souboru vloženy tak, jak platí v
moment vygenerování. To znamená, že při vygenerování tabulky v příštím
školním roce bude třída žáka z tercie kvarta, i když přihlášení proběhlo
v tercii.

## Povýšení uživatele na správce a oprava výběru třídy

![Navigační lišta se zvýrazněným odkazem "Správa Uživatelů"](assets/manage-users.png)

Pro správce je v hlavní nabídce dostupná položka "Správa Uživatelů". Na
této stránce najdete seznam všech uživatelů, kteří se kdy přihlásili do
aplikace, spolu s jejich třídou a statusem správcovství.

U každého uživatele je tlačítko "Upravit", po jehož stisknutí je možné
pro uživatele vybrat jakoukoliv třídu, nebo mu změnit roli (povýšení na
či degradování ze) správce.

Poznámka: správce nemůže sám sebe degradovat ze správce na uživatele.

## Odstraňování uživatelů

V krajních případech je možné databázovou reprezentaci uživatelských
účtů odstranit. Je důležité zmínit, že vymazání nesmaže korespondující
Google účet a nezakáže uživatelům si založit účet znovu -- odstranění
vymaže všechny informace o účtu (jméno, třída, status správcovství) a
konexe k Akcím (všechny přihlášky na možnosti Akcí).

Vymazání účtu je možné přes vyskakovací okno k úpravě uživatele na
stránce "Správa Uživatelů".

Poznámka: správce může odstranit všechny uživatele kromě sebe, takže pro
smazání všech uživatelů v systému je nutné využít přímý přístup k
databázi.

## Diverzifikace oprávnění uživatelů a správců

Uživatelé mají následující oprávnění:

-   Účet

    -   Přihlásit se

    -   Změnit svou třídu

-   Akce

    -   Zobrazit Akce své třídy

    -   Zobrazit možnosti jakékoliv Akce

    -   Přihlásit se na možnost Akce / odhlásit se z Akce, u které právě
        probíhá přihlašování, a která je relevantní pro zvolenou třídu.

Správci mají ze základu všechna oprávnění jako uživatelé. Navíc mají
ještě tato:

-   Účet

    -   Změnit třídu jiných uživatelů

    -   Změnit roli jiných uživatelů (přidání správcovských oprávnění)

-   Akce

    -   Vytvořit novou Akci

    -   Upravit Akci (viz kapitola [Vytváření a úprava
        Akcí](#vytváření-a-úprava-akcí))

    -   Odstranit Akci

    -   Vytvořit novou možnost Akce

    -   Upravit možnosti Akce (viz kapitola [Vytváření a úprava
        možností Akce](#vytváření-a-úprava-možností-akce))

    -   Odstranit možnosti Akce

    -   Vygenerovat soubory .xlsx z Akcí (viz kapitola [Exportování dat Akce do souboru .xlsx](#exportování-dat-akce-do-souboru-.xlsx))

[^1]:
    Pro instrukce pro správce o tom, jak přidat správcovská oprávnění
    dalším uživatelům konzultujte kapitolu [Povýšení uživatele na
    správce a oprava výběru
    třídy](#povýšení-uživatele-na-správce-a-oprava-výběru-třídy).

[^2]: Třídy se identifikují jejich dvouznakovou zkratkou (např. 1G, 1N).
[^3]: Kategorie, do které daný seminář zapadá.
[^4]:
    Tato data se vztahují k časovému pásmu počítače, na kterém se Akce
    vytváří. To znamená, že kdyby vytvářel Akci uživatel v Anglii,
    přihlašování by v Česku začalo již ve 23:00 předchozího dne a
    skončilo ve 22:59 v posledním dni přihlašování

[^5]:
    Odstranění Akce neodstraní jen Akci jako takovou, ale i všechny
    její možnosti a registrační data. To znamená, že mazání Akcí je
    nenávratné a mělo by se provádět jen v krajních případech.

[^6]:
    Systém nepodporuje pro počty hodin necelé číselné údaje, což
    znamená, že předmět, který má 1 hodinu za čtrnáct dní není validní
    seminář.
