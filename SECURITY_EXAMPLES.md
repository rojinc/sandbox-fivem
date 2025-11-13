# Security Implementation Examples

This document shows before/after examples of securing events across the codebase.

## Example 1: Vehicle Repair Events (High Priority - Exploit Risk)

### Before (VULNERABLE):
```lua
-- server/resources/[sandbox]/sandbox-vehicles/server/sync.lua

RegisterServerEvent('VehicleSync:Server:BodyRepair', function(vNet, door, loose, instant)
    local veh = NetworkGetEntityFromNetworkId(vNet)
    local ent = Entity(veh)
    if ent and ent.state then
        ent.state.Damage = {
            Body = 1000.0,
            Engine = 1000.0
        }
        ent.state.RepairKits = 0
        ent.state.BlownUp = false
    end
    TriggerClientEvent('VehicleSync:Client:BodyRepair', -1, vNet)
end)
```

**RISK**: Executor can trigger unlimited free repairs on any vehicle!

### After (SECURED):
```lua
-- server/resources/[sandbox]/sandbox-vehicles/server/sync.lua

exports['sandbox-base']:RegisterSecuredServerEvent('VehicleSync:Server:BodyRepair', function(vNet, door, loose, instant)
    local source = source

    -- Validate vehicle exists
    local veh = NetworkGetEntityFromNetworkId(vNet)
    if not veh or not DoesEntityExist(veh) then
        return
    end

    -- Validate player has permission (owns vehicle or is mechanic)
    local char = exports['sandbox-characters']:FetchCharacterSource(source)
    if not char then return end

    local vehState = Entity(veh).state
    if not vehState or not vehState.VIN then
        return
    end

    -- Check if player owns vehicle or has mechanic job
    local hasPermission = false
    if char:GetData('Job') == 'mechanic' and exports['sandbox-jobs']:JobsDutyGet(source) then
        hasPermission = true
    else
        local vehicle = exports['sandbox-vehicles']:OwnedGetActive(vehState.VIN)
        if vehicle and vehicle:GetData('Owner').Id == char:GetData('SID') then
            hasPermission = true
        end
    end

    if not hasPermission then
        exports['sandbox-base']:LoggerWarn("Security",
            string.format("Unauthorized repair attempt by %s on vehicle %s", source, vehState.VIN))
        return
    end

    local ent = Entity(veh)
    if ent and ent.state then
        ent.state.Damage = {
            Body = 1000.0,
            Engine = 1000.0
        }
        ent.state.RepairKits = 0
        ent.state.BlownUp = false
    end
    TriggerClientEvent('VehicleSync:Client:BodyRepair', -1, vNet)
end, {
    requireToken = true,
    checkRate = true
})
```

**CLIENT SIDE UPDATE:**
```lua
-- client/sync.lua

-- Before
TriggerServerEvent('VehicleSync:Server:BodyRepair', vNet)

-- After
exports['sandbox-base']:TriggerSecuredServerEvent('VehicleSync:Server:BodyRepair', vNet)
```

---

## Example 2: Item Give Events (Critical - Money Exploit)

### Before (VULNERABLE):
```lua
-- server/resources/[sandbox]/sandbox-inventory/server/itemuse.lua

RegisterServerEvent('Inventory:Server:GiveItem', function(targetId, item, count)
    local source = source
    exports.ox_inventory:AddItem(targetId, item, count)
end)
```

**RISK**: Executor can spawn unlimited items to anyone!

### After (SECURED):
```lua
exports['sandbox-base']:RegisterSecuredServerEvent('Inventory:Server:GiveItem', function(targetId, item, count)
    local source = source

    -- Validate inputs
    if type(targetId) ~= "number" or type(item) ~= "string" or type(count) ~= "number" then
        return
    end

    if count < 1 or count > 100 then
        return
    end

    -- Validate source has the item
    local sourceItem = exports.ox_inventory:GetItem(source, item, nil, true)
    if not sourceItem or sourceItem < count then
        exports['sandbox-base']:LoggerWarn("Security",
            string.format("Player %s tried to give item they don't have: %s x%d", source, item, count))
        return
    end

    -- Validate target exists and is nearby
    local sourceCoords = GetEntityCoords(GetPlayerPed(source))
    local targetCoords = GetEntityCoords(GetPlayerPed(targetId))
    if #(sourceCoords - targetCoords) > 5.0 then
        return
    end

    -- Remove from source, add to target
    if exports.ox_inventory:RemoveItem(source, item, count) then
        exports.ox_inventory:AddItem(targetId, item, count)
    end
end, {
    requireToken = true,
    checkRate = true
})
```

---

## Example 3: Admin Commands (Critical - Server Control)

### Before (VULNERABLE):
```lua
RegisterServerEvent('Admin:BanPlayer', function(targetId, reason, duration)
    -- Anyone with executor can ban players!
    BanPlayer(targetId, reason, duration)
end)
```

**RISK**: Executor users can ban everyone on the server!

### After (SECURED):
```lua
exports['sandbox-base']:RegisterSecuredServerEvent('Admin:BanPlayer', function(targetId, reason, duration)
    local source = source

    -- Validate admin permission
    local player = exports['sandbox-base']:FetchSource(source)
    if not player then return end

    local isAdmin = false
    for k, v in ipairs(player:GetData("Groups")) do
        if v == "admin" or v == "owner" then
            isAdmin = true
            break
        end
    end

    if not isAdmin then
        exports['sandbox-base']:LoggerError("Security",
            string.format("Non-admin %s attempted to ban player %s", source, targetId))
        exports['sandbox-base']:SecurityBanPlayer(source, "Attempted unauthorized admin action")
        return
    end

    -- Validate inputs
    if type(targetId) ~= "number" or type(reason) ~= "string" then
        return
    end

    -- Execute ban
    BanPlayer(targetId, reason, duration)

    exports['sandbox-base']:LoggerInfo("Admin",
        string.format("Admin %s banned player %s: %s",
            player:GetData("Name"), targetId, reason))
end, {
    requireToken = true,
    checkRate = true
})
```

---

## Example 4: Money/Economy Events (Critical - Economy Exploit)

### Before (VULNERABLE):
```lua
RegisterServerEvent('Economy:DepositMoney', function(amount)
    -- No validation!
    GivePlayerMoney(source, amount)
end)
```

**RISK**: Executor can spawn billions of dollars!

### After (SECURED):
```lua
exports['sandbox-base']:RegisterSecuredServerEvent('Economy:DepositMoney', function(amount)
    local source = source

    -- Validate amount
    if type(amount) ~= "number" or amount < 1 or amount > 1000000 then
        exports['sandbox-base']:LoggerWarn("Security",
            string.format("Invalid deposit amount from %s: %s", source, tostring(amount)))
        return
    end

    -- Validate player has cash
    local char = exports['sandbox-characters']:FetchCharacterSource(source)
    if not char then return end

    local cash = char:GetData("Cash")
    if cash < amount then
        exports['sandbox-base']:LoggerWarn("Security",
            string.format("Player %s tried to deposit more than they have: %d (has %d)",
                source, amount, cash))
        return
    end

    -- Process deposit (remove cash, add to bank)
    char:SetData("Cash", cash - amount)
    local account = exports['sandbox-finance']:AccountsGet(char:GetData("BankAccount"))
    if account then
        exports['sandbox-finance']:BalanceDeposit(account.Account, amount, false, true)
    end
end, {
    requireToken = true,
    checkRate = true
})
```

---

## Example 5: Property Purchase (Critical - Asset Exploit)

### Before (VULNERABLE):
```lua
RegisterServerEvent('Properties:PurchaseProperty', function(propertyId)
    GivePlayerProperty(source, propertyId)
end)
```

**RISK**: Free properties for everyone with executor!

### After (SECURED):
```lua
exports['sandbox-base']:RegisterSecuredServerEvent('Properties:PurchaseProperty', function(propertyId)
    local source = source

    -- Validate input
    if type(propertyId) ~= "string" or propertyId == "" then
        return
    end

    local char = exports['sandbox-characters']:FetchCharacterSource(source)
    if not char then return end

    -- Get property data
    local property = exports['sandbox-properties']:FetchProperty(propertyId)
    if not property or property.Owned then
        return
    end

    -- Check player location (must be at property)
    local playerCoords = GetEntityCoords(GetPlayerPed(source))
    local propertyCoords = property.Location
    if #(playerCoords - propertyCoords) > 10.0 then
        exports['sandbox-base']:LoggerWarn("Security",
            string.format("Player %s tried to buy property %s from too far away", source, propertyId))
        return
    end

    -- Check funds
    local price = property.Price
    local account = exports['sandbox-finance']:AccountsGet(char:GetData("BankAccount"))
    if not account or exports['sandbox-finance']:BalanceGet(account.Account) < price then
        return
    end

    -- Process purchase
    if exports['sandbox-finance']:BalanceWithdraw(account.Account, price, false, true) then
        GivePlayerProperty(source, propertyId)
        exports['sandbox-base']:LoggerInfo("Economy",
            string.format("Player %s purchased property %s for $%d",
                char:GetData("Name"), propertyId, price))
    end
end, {
    requireToken = true,
    checkRate = true
})
```

---

## Example 6: Job Actions (Medium Priority)

### Before (VULNERABLE):
```lua
RegisterServerEvent('Police:ArrestPlayer', function(targetId, time)
    ArrestPlayer(targetId, time)
end)
```

**RISK**: Executor can arrest anyone!

### After (SECURED):
```lua
exports['sandbox-base']:RegisterSecuredServerEvent('Police:ArrestPlayer', function(targetId, time)
    local source = source

    -- Validate inputs
    if type(targetId) ~= "number" or type(time) ~= "number" then
        return
    end

    if time < 1 or time > 999 then
        return
    end

    -- Validate police officer
    local char = exports['sandbox-characters']:FetchCharacterSource(source)
    if not char then return end

    if char:GetData('Job') ~= 'police' or not exports['sandbox-jobs']:JobsDutyGet(source) then
        exports['sandbox-base']:LoggerWarn("Security",
            string.format("Non-police %s tried to arrest player %s", source, targetId))
        return
    end

    -- Validate target nearby
    local sourceCoords = GetEntityCoords(GetPlayerPed(source))
    local targetCoords = GetEntityCoords(GetPlayerPed(targetId))
    if #(sourceCoords - targetCoords) > 5.0 then
        return
    end

    -- Execute arrest
    ArrestPlayer(targetId, time)

    exports['sandbox-base']:LoggerInfo("Police",
        string.format("Officer %s arrested player %s for %d months",
            char:GetData("Name"), targetId, time))
end, {
    requireToken = true,
    checkRate = true
})
```

---

## Mass Migration Script

Use this script to help identify all events that need securing:

```lua
-- tools/security_audit.lua

local fs = require('fs')
local path = require('path')

local function findAllEvents(directory)
    local events = {}
    local files = fs.readdirSync(directory)

    for _, file in ipairs(files) do
        local fullPath = path.join(directory, file)
        local stat = fs.statSync(fullPath)

        if stat.isDirectory() then
            local subEvents = findAllEvents(fullPath)
            for k, v in pairs(subEvents) do
                events[k] = v
            end
        elseif file:match('%.lua$') then
            local content = fs.readFileSync(fullPath, 'utf8')

            -- Find RegisterServerEvent
            for eventName in content:gmatch('RegisterServerEvent%(%s*["\'](.-)["\']]%s*,') do
                events[eventName] = events[eventName] or {}
                table.insert(events[eventName], fullPath)
            end

            -- Find RegisterNetEvent
            for eventName in content:gmatch('RegisterNetEvent%(%s*["\'](.-)["\']]%s*,') do
                events[eventName] = events[eventName] or {}
                table.insert(events[eventName], fullPath)
            end
        end
    end

    return events
end

print("Scanning for unsecured events...")
local events = findAllEvents('server/resources/[sandbox]')

print(string.format("\nFound %d unique events:", #events))
for eventName, locations in pairs(events) do
    print(string.format("  - %s", eventName))
    for _, location in ipairs(locations) do
        print(string.format("      %s", location))
    end
end

print("\n⚠️  SECURITY AUDIT COMPLETE")
print("Review each event and secure with exports['sandbox-base']:RegisterSecuredServerEvent")
```

---

## Priority Checklist

### Phase 1: Critical (Do First)
- [ ] All economy/money events
- [ ] All item give/remove events
- [ ] All admin commands
- [ ] All ban/kick events
- [ ] All property/vehicle ownership events

### Phase 2: High Priority
- [ ] Vehicle repair/modify events
- [ ] Job action events (arrest, heal, etc.)
- [ ] Weapon/combat events
- [ ] Teleport/noclip events

### Phase 3: Medium Priority
- [ ] UI interaction events
- [ ] Notification events
- [ ] Status update events
- [ ] Animation events

### Phase 4: Low Priority (Optional)
- [ ] Cosmetic change events
- [ ] Read-only query events
- [ ] Chat message events

---

## Testing Checklist

After securing events:

1. ✅ Test normal gameplay works
2. ✅ Test rate limiting (rapid fire events)
3. ✅ Test invalid token (should block)
4. ✅ Test executor detection (should auto-ban)
5. ✅ Check logs for security events
6. ✅ Verify no false positives

---

## Summary

**Remember:**
- Secure ALL events that modify server state
- Always validate inputs on server
- Never trust client data
- Log suspicious activity
- Test thoroughly before production

**The goal:** Make it impossible for executors to affect your server!
