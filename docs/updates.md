nous allons appliquer quelques maj 

# cote client (boutique)

### devis
lorsqu'on est connecte , nos coordonnees sont autofill dans le formulaire



# Admin

### sidebar
Reordonnes les modules de sorte a mettre de cote ce qui se rapproche le plus
### abonnement
dans ce module l'admin doit pouvoir modifier les formules d'abonnement et les prix. il doit aussi pouvoir voir les abonnements souscrits par les clients.

### produits
- on doit pouvoir avoir des checkbox pour une selection multiple . assures toi de ne pas casser le UI de la page. il faut que tout soit bien structurer
- dans la modification d'un produit, le box organisation ne reflete pas le statut rel du produit check cela. lorsque le produit est inactif et qu'on rentre dans la page de modif l'organisation est activé (statut = actif), ce qui n'est pas normal.
- lorsque le produit est inactif , on ne peut pas le voir sur le site
- revois l'affichage des status dans la colonne statut . il n' ya que actif et inactif (brouillon) et pourtant on a 3 status visible sur le UI (Actif, en rupture et brouillon) regle cela. 
- lorsque le produit est en rupture, il doit toujours etre visible dans la boutique mais avec la ention rupture (check d'abord si le backend renvoie cela dans la reponse du get all product avant de faire quoi que ce soit)

### clients
- comment changer le segment du client ?? pour le mettre en VIP ou entreprise ??

### devis
- je me perds avec les status (en cours, etc....). j'ai du mal a passe d'un statut a un autre et j'ai du mal a enregistrer les modifications d'un devis recemment recu

### location
- par defaut choisis le mois dans lequel nous sommes
- lors de l'ajout d'un equipement on doit pouvoir upload une photo

### marketing
- branche les KPIS au backend, si l'endpoint n/est pas dispo signale le. on elimine les valeurs mockees
- dans la partie evenements et creations je ne parviens pas a choisir les produits phares pour un event
- mets en side drawer la creation du code promo, campagne marketing, etc...
en ce qui concerne la campagne marketing , il faut que ce soit bien fait, que les champs correspondent a ceux du backend. fais attention aux canaux non implementes


#### all modules
- applique la pagination s'il y a une longue affichage. si le banckend ne le fiat pas fais le cote frontend
