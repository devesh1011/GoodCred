# Admin Quest Management UI - Quick Start Guide

## 📋 What's New

We've implemented **Phase 1** of the Admin Quest Management system, which allows authorized admins to create and manage quests directly through the frontend.

### New Components & Hooks

| File | Purpose |
|------|---------|
| `useOwnerCheck` | Verifies if wallet is contract owner |
| `useAdminQuests` | Contract calls for quest operations |
| `OwnerGuard` | Access control component |
| `QuestForm` | Quest creation/edit form |
| `/admin` pages | Admin dashboard & management |

### New Files Created
- `frontend/src/hooks/useOwnerCheck.ts`
- `frontend/src/hooks/useAdminQuests.ts`
- `frontend/src/lib/questFormSchema.ts`
- `frontend/src/lib/adminUtils.ts`
- `frontend/src/components/admin/OwnerGuard.tsx`
- `frontend/src/components/admin/QuestForm.tsx`
- `frontend/src/app/admin/layout.tsx`
- `frontend/src/app/admin/page.tsx`
- `frontend/src/app/admin/quests/page.tsx`

## 🚀 How to Use

### Access the Admin Panel
```
1. Go to your app → click "Admin" (when you're the owner)
2. Or navigate directly to: /admin
3. OwnerGuard will verify your wallet is the contract owner
4. If verified → see dashboard
5. If not → see "Access Denied" message
```

### Create a Quest
```
1. Navigate to: /admin/quests
2. Click "Create Quest" button
3. Fill in the form:
   ✓ Description (what users should do)
   ✓ Points (1-500)
   ✓ Type (On-Chain or Off-Chain)
   ✓ If On-Chain: Contract address
   ✓ If Off-Chain: Provider name & data key
   ✓ Active status (toggle)
4. Click "Create Quest"
5. Wait for blockchain confirmation
6. Success! Quest is now available
```

## 🔧 Technical Details

### Access Control
- Only the **QuestRegistry contract owner** can access admin pages
- Verified on-chain by checking `owner()` function
- Non-owners see "Access Denied" page

### Quest Form
- **On-Chain Quests**: User performs blockchain action
  - Requires: target contract address
  - Tracks: on-chain transaction/balance
  
- **Off-Chain Quests**: User's external data is verified
  - Requires: Reclaim provider (twitter, linkedin, etc.)
  - Requires: data key to verify (email, username, etc.)

### Form Validation
- All fields validated with Zod schema
- Real-time error display
- Conditional fields shown based on quest type
- Submit button disabled until form is valid

## 📱 UI/UX Features

✅ **Access Control**
- Wallet not connected → "Connect Wallet" message
- Not owner → "Access Denied" message  
- Is owner → See admin dashboard

✅ **Admin Dashboard**
- Quick stats overview (quests, completions, rates)
- Navigation to quest management
- Shows owner address and connected wallet

✅ **Quest Management**
- Create new quests inline
- Form shows based on quest type
- Error messages per field
- Loading state during submission

## 🔄 Data Flow

```
Admin fills form
        ↓
Zod validation
        ↓
useAdminQuests.createQuest()
        ↓
Format data → Call contract
        ↓
Transaction confirmed
        ↓
Success logged to console
```

## 📝 Testing

### Manual Testing Checklist
- [ ] Navigate to `/admin` - should see dashboard (if owner)
- [ ] Navigate to `/admin/quests` - should see management page
- [ ] Click "Create Quest" - form appears
- [ ] Fill form with invalid data - see error messages
- [ ] Try on-chain quest - see contract address field
- [ ] Try off-chain quest - see provider/key fields
- [ ] Submit valid form - transaction goes to chain
- [ ] Check browser console - see transaction hash logged

### Test with Non-Owner Wallet
- [ ] Connect with non-owner wallet
- [ ] Navigate to `/admin` - should see "Access Denied"
- [ ] Try direct URL `/admin/quests` - should see "Access Denied"

## 🚧 Phase 2 (Coming Soon)

The following features are ready for Phase 2:

- [ ] Quest list table (sortable, paginated)
- [ ] Edit existing quests
- [ ] Delete quests (with confirmation)
- [ ] Search & filter quests
- [ ] Quest statistics dashboard
- [ ] Bulk operations

See `ADMIN_IMPLEMENTATION_SUMMARY.md` for full details.

## ❓ FAQ

**Q: Why is the quest list table not showing?**
A: Phase 1 focused on quest creation. Quest listing comes in Phase 2.

**Q: Can I edit quests I created?**
A: Phase 2 will add edit functionality. For now, create new quests.

**Q: Why do I get "Access Denied"?**
A: Only the QuestRegistry contract owner can access admin pages. Make sure you're connected with the owner wallet.

**Q: How do I know if I'm the owner?**
A: Check the admin dashboard - it shows the owner address and your connected wallet address.

**Q: What if the form won't submit?**
A: Check for red error messages and fix each field. All errors must be resolved before submitting.

## 📚 Related Documentation

- `ADMIN_IMPLEMENTATION_SUMMARY.md` - Full technical documentation
- `contracts_prd.md` - Smart contract specifications
- `frontend_prd.md` - Frontend specifications

---

**Status:** ✅ Phase 1 Complete
**Next:** Phase 2 - Quest listing, editing, deletion
