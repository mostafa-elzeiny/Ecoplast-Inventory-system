# Security Specification & Threat Model - Eco Plast Inventory

This document defines the data invariants, threat model ("Dirty Dozen" payloads), and test assertions for the Eco Plast Inventory Management system.

## 1. Data Invariants & Authorization Logic

1. **Authentication**: All read and write operations require a valid, authenticated user account.
2. **Role Mapping**:
   - `admin`: Full CRUD permissions on categories, products, transactions, and activity logs.
   - `staff`: Read permissions on all collections. Write permissions (create/update) for products and transactions to log stock movements. No permissions to delete anything.
   - `read`: Read-only access to all collections. No write/delete permissions.
3. **Data Integrity constraints**:
   - Every product MUST have a valid category reference.
   - Products and Transactions MUST have correct types (`quantity` as number, timestamps as server timestamps, etc.).
   - Modifying previous records is restricted to prevent inventory manipulation.

---

## 2. The "Dirty Dozen" Threat Payloads

The following 12 attack payloads are designed to bypass the application's rules. Our Firestore rules must reject all of these.

### Threat Group A: Identity & Role Escalation
1. **Unauthenticated Write**: An unauthenticated attacker attempts to write a new product.
2. **Anonymous Create**: An anonymous user highlights themselves as admin to create a product.
3. **Identity Spoofing**: User `test-user@attack.com` writes a product setting the `updatedBy` field to `mostafa.elzeiny11@gmail.com` to spoof identity.
4. **Privilege Escalation**: A `read` or `staff` role tries to execute a delete on a product document.

### Threat Group B: Data Poisoning & Boundary Violations
5. **ID Poisoning Attack**: Attacker attempts to create a product with a 2MB binary string as direct document ID to cause Denial of Wallet (resource bloat).
6. **Negative Inventory Injection**: Attacker attempts to create/update a product with negative quantity.
7. **Invalid Format/Missing Fields injection**: Attacker attempts to create a product without the required `code` and `nameEn` properties.
8. **Junk Field Pollution**: Attacker attempts to update a product by adding arbitrary keys like `{ isVerified: true, hacksEnabled: true }`.

### Threat Group C: Audit Trail & Transaction Tampering
9. **Transaction History Forgery**: Attacker attempts to write a fake positive inventory transaction without updating the actual product's current stock (violating transaction atomicity sync).
10. **Timestamp Manipulation**: Client attempts to input a custom back-dated `timestamp` (e.g., in 2020) instead of the present `request.time`.
11. **Activity Log Deletion**: Attacker attempts to delete system `activity_logs` documents to cover their tracks.
12. **Activity Log Spoofing**: Attacker attempts to write a fake system initialization log with spoofed administrative metadata.

---

## 3. Test Runner: Rules Verification Test

The rules can be verified against the rules.
