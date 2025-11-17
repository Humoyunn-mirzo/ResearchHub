# Constraints Naming Conventions


## 1. Primary Key constraint

Pattern:

```
pk_<table>
```

Example:

```
pk_user
pk_order
pk_message
```

---

## 2. Unique constraint

Pattern:

```
uq_<table>_<column>
```

Example:

```
uq_user_email
uq_order_number
uq_product_slug
```

---

## 3. Foreign Key constraint

Pattern:

```
fk_<table>_<column>
```

Examples:

```
fk_order_user_id
fk_order_product_id
fk_comment_post_id
```

---

## 4. Check constraint

Pattern:

Short description of what the rule enforces:

```
chk_<table>_<description>
```

or, if the check is associated with a single column:

```
chk_<table>_<column>
```

Examples:

```
chk_user_age_min
chk_order_price_positive
chk_subscription_end_after_start
```

---

## 5.Additional Rules

### Keep names lowercase

Postgres respects case, so lowercase avoids quoting.

### Avoid long names

Postgres has a 63-character identifier limit.
### Only use underscore between tokens

Avoid camelCase for constraints.

