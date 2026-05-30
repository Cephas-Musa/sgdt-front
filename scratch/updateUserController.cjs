const fs = require('fs');

const path = 'backend/app/Http/Controllers/UserController.php';
let content = fs.readFileSync(path, 'utf8');

const hierarchyPHP = `
    private $roleHierarchy = [
        'super_admin' => [
            'directeur',
            'directeur_provincial',
            'inspecteur_chef',
            'agent_controle',
            'chef_bureau_repr',
            'operateur_saisie',
            'chef_barriere',
            'typing_operator',
            'brigadier_barriere',
            'secretaire_inspecteur',
            'verificateur',
            'cb_verification',
            'chef_recherche',
            'chef_manifest',
            'agent_empty_manifest',
            'percepteur',
            'chef_entrepot_log',
            'chef_entrepot_douane',
            'brigadier_entrepot',
            'agent_pointage',
            'barriere_controle',
            'manager_entrepot',
            'partenaire'
        ],
        'directeur_general' => ['directeur_provincial', 'inspecteur_chef'],
        'directeur' => ['directeur_provincial', 'inspecteur_chef'],
        'directeur_provincial' => ['inspecteur_chef', 'agent_controle', 'chef_bureau_repr', 'chef_barriere'],
        'inspecteur_chef' => [
            'secretaire_inspecteur',
            'verificateur',
            'cb_verification',
            'chef_recherche',
            'chef_manifest',
            'chef_entrepot_log',
            'chef_entrepot_douane',
            'chef_barriere',
            'chef_bureau_repr',
            'barriere_controle',
            'manager_entrepot'
        ],
        'chef_bureau_repr' => ['operateur_saisie'],
        'chef_barriere' => ['typing_operator', 'brigadier_barriere'],
        'chef_manifest' => ['agent_empty_manifest', 'percepteur'],
        'chef_entrepot_log' => ['brigadier_entrepot', 'agent_pointage'],
        'chef_entrepot_douane' => ['brigadier_entrepot', 'agent_pointage'],
        'cb_verification' => ['verificateur'],
        'secretaire_inspecteur' => []
    ];

    private function getCreatableRoles($role) {
        return $this->roleHierarchy[$role] ?? [];
    }
`;

// Insert the hierarchy property inside the class
content = content.replace('class UserController extends Controller\n{', 'class UserController extends Controller\n{\n' + hierarchyPHP);

// Update index method
const newIndex = `    public function index(Request $request)
    {
        $currentUser = $request->user();
        $creatable = $this->getCreatableRoles($currentUser->role);
        
        // Si l'utilisateur n'a le droit de créer aucun compte, il ne peut pas lister
        if (empty($creatable)) {
            return response()->json(['message' => 'Non autorisé à voir les comptes.'], 403);
        }

        // On retourne tous les users, le frontend filtrera. Ou on pourrait filtrer ici.
        $users = User::all();
        return response()->json($users);
    }`;
content = content.replace(/public function index.*?return response\(\)->json\(\$users\);\n    }/s, newIndex);

// Update store method
const newStore = `    public function store(Request $request)
    {
        $currentUser = $request->user();
        $creatable = $this->getCreatableRoles($currentUser->role);
        
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string'
        ]);

        $roleToCreate = $request->input('role');

        if (!in_array($roleToCreate, $creatable)) {
            return response()->json(['message' => "Vous n'êtes pas autorisé à créer un compte avec le rôle $roleToCreate."], 403);
        }

        $password = Str::random(10);

        $userData = $request->except(['password']);
        $userData['password'] = Hash::make($password);
        $userData['parent_id'] = $currentUser->id; // Traçabilité

        $user = User::create($userData);

        return response()->json([
            'user' => $user,
            'plain_password' => $password,
            'message' => 'Compte créé avec succès. Mot de passe : ' . $password
        ], 201);
    }`;
content = content.replace(/public function store.*?return response\(\)->json\(\[\n            'user' => \$user.*?\n        \], 201\);\n    }/s, newStore);

// Update update method
const newUpdate = `    public function update(Request $request, $id)
    {
        $currentUser = $request->user();
        $userToUpdate = User::findOrFail($id);
        
        if ($currentUser->id !== $userToUpdate->id) {
            $creatable = $this->getCreatableRoles($currentUser->role);
            if (!in_array($userToUpdate->role, $creatable)) {
                return response()->json(['message' => "Non autorisé à modifier cet utilisateur."], 403);
            }
        }

        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$id,
            'role' => 'sometimes|string'
        ]);

        if ($request->has('role') && $request->input('role') !== $userToUpdate->role) {
            $creatable = $this->getCreatableRoles($currentUser->role);
            if (!in_array($request->input('role'), $creatable)) {
                return response()->json(['message' => "Non autorisé à assigner ce rôle."], 403);
            }
        }

        $userToUpdate->update($request->except(['password']));

        return response()->json(['message' => 'Compte mis à jour avec succès.', 'user' => $userToUpdate]);
    }`;
content = content.replace(/public function update.*?return response\(\)->json\(\['message' => 'Compte mis à jour.*?\n    }/s, newUpdate);

// Update destroy method
const newDestroy = `    public function destroy(Request $request, $id)
    {
        $currentUser = $request->user();
        $userToDelete = User::findOrFail($id);

        if ($currentUser->id === $userToDelete->id) {
            return response()->json(['message' => "Vous ne pouvez pas supprimer votre propre compte."], 403);
        }

        $creatable = $this->getCreatableRoles($currentUser->role);
        if (!in_array($userToDelete->role, $creatable)) {
            return response()->json(['message' => "Non autorisé à supprimer cet utilisateur."], 403);
        }

        $userToDelete->delete();
        return response()->json(['message' => 'Compte supprimé avec succès.']);
    }`;
content = content.replace(/public function destroy.*?return response\(\)->json\(\['message' => 'Compte supprimé.*?\n    }/s, newDestroy);

fs.writeFileSync(path, content);
console.log('UserController updated successfully.');
