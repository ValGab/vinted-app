# Vinted Back

### Quick start

```
npm i
npx nodemon
```

## Models

- User
- Offer

## Offer routes

<table>
<thead>
<tr>
<th>Route</th><th>Type</th><th>Query / Body / Params</th><th>User connected</th>
</tr>
</thead>
<tbody>
<tr><td>/offer/publish</td><td>POST</td><td>title, description, price, brand, size, city, condition, color, picture</td><td>Yes</td></tr>
<tr><td>/offer/modify</td><td>PUT</td><td>id, title, description, price, brand, size, city, condition, color, picture<td><td>Yes</td></tr>
<tr><td>/offer/delete</td><td>DELETE</td><td>id</td><td>Yes</td></tr>
<tr><td>/offers</td><td>GET</td><td>title, priceMin, priceMax, limit, page, sort</td><td>No</td></tr>
<tr><td>/offer/:id</td><td>GET</td><td>id</td><td>No</td></tr>
<tr><td>/offer/payment</td><td>POST</td><td>amount, description, stripeToken</td><td>No</td></tr>
</tbody>
</table>

## User routes

<table>
<thead>
<tr>
<th>Route</th><th>Type</th><th>Query / Body / Params</th><th>User connected</th>
</tr>
</thead>
<tbody>

<tr><td>/user/signup</td><td>POST</td><td>username, email, password, newsletter, avatar</td><td>No</td></tr>
<tr><td>/user/login</td><td>POST</td><td>email, password</td><td>No</td></tr>
</tbody>
</table>
