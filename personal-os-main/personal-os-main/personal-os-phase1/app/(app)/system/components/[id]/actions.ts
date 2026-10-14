'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { componentUpdateSchema } from '@/lib/validation/component';
import { canTransition } from '@/lib/domain/lifecycle';

const allowedConfidence = new Set([
  'low',
  'medium',
  'high'
]);


export async function updateComponentConfidence(
  formData: FormData
) {
  const componentId = String(
    formData.get('componentId') || ''
  ).trim();

  const confidence = String(
    formData.get('confidence') || ''
  ).trim();

  if (
    !componentId ||
    !allowedConfidence.has(confidence)
  ) {
    throw new Error(
      'Invalid confidence update.'
    );
  }

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const {
    data: component,
    error: lookupError
  } = await supabase
    .from('components')
    .select('id')
    .eq('id', componentId)
    .single();

  if (lookupError || !component) {
    throw new Error(
      'Component unavailable.'
    );
  }

  const {
    error: updateError
  } = await supabase
    .from('components')
    .update({
      confidence,
      updated_at:
        new Date().toISOString()
    })
    .eq('id', componentId);

  if (updateError) {
    console.error(
      'Confidence update failed',
      {
        componentId,
        error: updateError
      }
    );

    throw new Error(
      'Unable to update confidence.'
    );
  }

  revalidatePath(
    `/system/components/${componentId}`
  );
}

export async function updateComponentDetails(
  formData: FormData
) {
  const parsed =
    componentUpdateSchema.safeParse({
      componentId:
        formData.get('componentId'),
      title: formData.get('title'),
      description:
        formData.get('description') ||
        undefined,
      category:
        formData.get('category') ||
        undefined,
      helpfulWhen:
        formData.get('helpfulWhen') ||
        undefined,
      costlyWhen:
        formData.get('costlyWhen') ||
        undefined
    });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        'Invalid component update.'
    );
  }

  const data = parsed.data;

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: component } =
    await supabase
      .from('components')
      .select('id')
      .eq('id', data.componentId)
      .single();

  if (!component) {
    throw new Error(
      'Component unavailable.'
    );
  }

  const { error } = await supabase
    .from('components')
    .update({
      title: data.title,
      description:
        data.description ?? null,
      category:
        data.category ?? null,
      helpful_when:
        data.helpfulWhen ?? null,
      costly_when:
        data.costlyWhen ?? null,
      updated_at:
        new Date().toISOString()
    })
    .eq('id', data.componentId);

  if (error) {
    console.error(
      'Component update failed',
      error
    );

    throw new Error(
      'Unable to update Component.'
    );
  }

  revalidatePath(
    `/system/components/${data.componentId}`
  );
}

export async function updateComponentStatus(
  formData: FormData
) {
  const componentId = String(
    formData.get('componentId') || ''
  ).trim();

  const targetStatus = String(
    formData.get('status') || ''
  ).trim();

  if (
    !componentId ||
    !targetStatus
  ) {
    throw new Error(
      'Invalid lifecycle update.'
    );
  }

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const {
    data: component,
    error
  } = await supabase
    .from('components')
    .select('id,status')
    .eq('id', componentId)
    .single();

  if (error || !component) {
    throw new Error(
      'Component unavailable.'
    );
  }

  if (
    !canTransition(
      component.status as any,
      targetStatus as any
    )
  ) {
    throw new Error(
      'Lifecycle transition not permitted.'
    );
  }

  const {
    error: updateError
  } = await supabase
    .from('components')
    .update({
      status: targetStatus,
      updated_at:
        new Date().toISOString()
    })
    .eq('id', componentId);

  if (updateError) {
    throw new Error(
      'Unable to update component status.'
    );
  }

  revalidatePath(
    `/system/components/${componentId}`
  );
}

export async function createRelationship(
  formData: FormData
) {
  const componentId = String(
    formData.get('componentId') || ''
  ).trim();

  const targetComponentId = String(
    formData.get('targetComponentId') || ''
  ).trim();

  const relationshipType = String(
    formData.get('relationshipType') || ''
  ).trim();

  const notes = String(
    formData.get('notes') || ''
  ).trim();

  if (
    !componentId ||
    !targetComponentId ||
    !relationshipType
  ) {
    throw new Error(
      'Invalid relationship.'
    );
  }

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { error } =
    await supabase
      .from('component_links')
      .insert({
        source_component_id:
          componentId,
        target_component_id:
          targetComponentId,
        relationship_type:
          relationshipType,
        notes: notes || null
      });

  if (error) {
    throw new Error(
      'Unable to create relationship.'
    );
  }

  revalidatePath(
    `/system/components/${componentId}`
  );
}

export async function removeRelationship(
  formData: FormData
) {
  const relationshipId = String(
    formData.get('relationshipId') || ''
  ).trim();

  const componentId = String(
    formData.get('componentId') || ''
  ).trim();

  if (!relationshipId) {
    throw new Error(
      'Relationship unavailable.'
    );
  }

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  await supabase
    .from('component_links')
    .delete()
    .eq('id', relationshipId);

  revalidatePath(
    `/system/components/${componentId}`
  );
}





export async function assignTag(
  formData: FormData
) {
  const componentId = String(
    formData.get('componentId') || ''
  ).trim();

  const tagId = String(
    formData.get('tagId') || ''
  ).trim();

  if (!componentId || !tagId) {
    throw new Error(
      'Invalid tag assignment.'
    );
  }

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { error } = await supabase
    .from('component_tags')
    .insert({
      component_id: componentId,
      tag_id: tagId
    });

  if (error) {
    throw new Error(
      'Unable to assign tag.'
    );
  }

  revalidatePath(
    `/system/components/${componentId}`
  );
}




export async function createTagAndAssign(
  formData: FormData
) {
  const componentId = String(
    formData.get('componentId') || ''
  ).trim();

  const tagName = String(
    formData.get('tagName') || ''
  ).trim();

  if (!componentId || !tagName) {
    throw new Error(
      'Invalid tag creation.'
    );
  }

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let tagId: string;

  const {
    data: existingTag
  } = await supabase
    .from('tags')
    .select('id')
    .eq('name', tagName)
    .single();

  if (existingTag) {
    tagId = existingTag.id;
  } else {
    const {
      data: newTag,
      error
    } = await supabase
      .from('tags')
      .insert({
        name: tagName
      })
      .select('id')
      .single();

    if (error || !newTag) {
      throw new Error(
        'Unable to create tag.'
      );
    }

    tagId = newTag.id;
  }

  await supabase
    .from('component_tags')
    .insert({
      component_id: componentId,
      tag_id: tagId
    });

  revalidatePath(
    `/system/components/${componentId}`
  );
}

export async function removeTag(
  formData: FormData
) {
  const componentId = String(
    formData.get('componentId') || ''
  ).trim();

  const tagId = String(
    formData.get('tagId') || ''
  ).trim();

  if (!componentId || !tagId) {
    throw new Error(
      'Invalid tag removal.'
    );
  }

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  await supabase
    .from('component_tags')
    .delete()
    .eq('component_id', componentId)
    .eq('tag_id', tagId);

  revalidatePath(
    `/system/components/${componentId}`
  );
}
